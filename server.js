const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

// 创建readline接口
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// 验证端口号是否有效
function isValidPort(port) {
  const portNum = parseInt(port);
  return !isNaN(portNum) && portNum >= 1 && portNum <= 65535;
}

// 加载敏感词列表
let badWords = [];
try {
  const badWordsContent = fs.readFileSync(path.join(__dirname, 'bad_word.txt'), 'utf8');
  badWords = badWordsContent.split('\n').filter(word => word.trim());
  console.log('敏感词列表加载完成');
} catch (error) {
  console.error('加载敏感词列表失败:', error);
}

// 检查消息是否包含敏感词
function containsBadWords(message) {
  return badWords.some(word => message.includes(word.trim()));
}

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// 提供静态文件
app.use(express.static(path.join(__dirname, 'public')));

// 用户列表
let users = [];

// 消息缓存，存储最近的消息
const messageCache = [];
const MAX_CACHE_MESSAGES = 500; // 最多缓存500条消息

// 添加消息到缓存
function addMessageToCache(message) {
  messageCache.push(message);
  // 如果缓存消息超过最大数量，删除最早的消息
  if (messageCache.length > MAX_CACHE_MESSAGES) {
    messageCache.shift();
  }
}

// Socket.io连接处理
io.on('connection', (socket) => {
  console.log('新用户连接');
  
  // 用户加入
  socket.on('join', (username) => {
    const user = {
      id: socket.id,
      username: username
    };
    
    users.push(user);
    
    // 通知所有用户有新用户加入
    io.emit('userJoined', { user: user, users: users });
    
    // 发送欢迎消息
    const welcomeMessage = {
      user: 'system',
      text: `欢迎 ${username} 加入聊天室!`,
      time: new Date().toLocaleTimeString()
    };
    socket.emit('message', welcomeMessage);
    
    // 发送缓存的历史消息
    if (messageCache.length > 0) {
      socket.emit('historicalMessages', messageCache);
    }
    
    // 通知其他用户
    const joinMessage = {
      user: 'system',
      text: `${username} 加入了聊天室!`,
      time: new Date().toLocaleTimeString()
    };
    socket.broadcast.emit('message', joinMessage);
  });
  
  // 处理消息
  socket.on('sendMessage', (message) => {
    const user = users.find(user => user.id === socket.id);
    if (user) {
      // 检查消息是否包含敏感词
      const finalMessage = containsBadWords(message) ? '***' : message;
      
      const messageData = {
        user: user.username,
        text: finalMessage,
        time: new Date().toLocaleTimeString()
      };
      io.emit('message', messageData);
      
      // 将消息添加到缓存
      addMessageToCache(messageData);
    }
  });
  
  // 用户断开连接
  socket.on('disconnect', () => {
    const index = users.findIndex(user => user.id === socket.id);
    
    if (index !== -1) {
      const user = users[index];
      users.splice(index, 1);
      
      // 通知其他用户
      const leaveMessage = {
        user: 'system',
        text: `${user.username} 离开了聊天室!`,
        time: new Date().toLocaleTimeString()
      };
      socket.broadcast.emit('message', leaveMessage);
      
      // 更新用户列表
      io.emit('userLeft', { userId: socket.id, users: users });
    }
  });
});

// 启动服务器
function startServer(port) {
  server.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
  });
}

// 获取端口号并启动服务器
const PORT = process.env.PORT;
if (PORT && isValidPort(PORT)) {
  startServer(parseInt(PORT));
} else {
  rl.question('请输入服务器端口号 (1-65535): ', (port) => {
    if (isValidPort(port)) {
      startServer(parseInt(port));
    } else {
      console.log('无效的端口号，将使用默认端口 80');
      startServer(80);
    }
    rl.close();
  });
}

// 管理员验证中间件
const ADMIN_USERNAME = 'admin'; // 修改为你的管理员用户名
const ADMIN_PASSWORD = 'admin123'; // 修改为你的管理员密码
function authenticateAdmin(username, password) {
   return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}

// 管理员API路由
app.post('/admin/clear-cache', express.json(), (req, res) => {
  const { username, password } = req.body;
  
  if (!authenticateAdmin(username, password)) {
    return res.status(401).json({ message: '认证失败' });
  }
  
  // 清空消息缓存
  messageCache.length = 0;
  
  // 广播系统消息
  const clearMessage = {
    user: 'system',
    text: '管理员已清空聊天记录',
    time: new Date().toLocaleTimeString()
  };
  io.emit('message', clearMessage);
  
  res.json({ message: '聊天记录已清空' });
});