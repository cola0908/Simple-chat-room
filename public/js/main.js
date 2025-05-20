// 连接到Socket.io服务器
const socket = io();

// DOM元素
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const loginContainer = document.getElementById('login-container');
const usernameInput = document.getElementById('username-input');
const loginButton = document.getElementById('login-button');
const cancelButton = document.getElementById('cancel-button');
const themeToggleButton = document.getElementById('theme-toggle');

// 用户名
let username = '';

// 表情映射
const emojis = {
  ':smile:': '😊',
  ':laugh:': '😂',
  ':sad:': '😢',
  ':angry:': '😠',
  ':heart:': '❤️',
  ':thumbsup:': '👍',
  ':clap:': '👏',
  ':fire:': '🔥',
  ':star:': '⭐',
  ':love:': '🥰',
  ':cool:': '😎',
  ':cry:': '😭',
  ':hug:': '🤗',
  ':think:': '🤔',
  ':party:': '🎉',
  ':eyes:': '👀',
  ':ok:': '👌',
  ':pray:': '🙏',
  ':rose:': '🌹',
  ':moon:': '🌙',
  ':sun:': '☀️',
  ':rainbow:': '🌈',
  ':cat:': '🐱',
  ':dog:': '🐶',
  ':panda:': '🐼',
  ':bear:': '🐻',
  ':rabbit:': '🐰',
  ':tiger:': '🐯',
  ':pizza:': '🍕',
  ':burger:': '🍔',
  ':sushi:': '🍣',
  ':apple:': '🍎',
  ':banana:': '🍌',
  ':coffee:': '☕',
  ':soccer:': '⚽',
  ':basketball:': '🏀',
  ':music:': '🎵',
  ':game:': '🎮',
  ':rain:': '🌧️',
  ':snow:': '🌨️',
  ':cloud:': '☁️',
  ':thunder:': '⚡'
};

// 显示登录框
function showLoginForm() {
  loginContainer.style.display = 'flex';
}

// 隐藏登录框
function hideLoginForm() {
  loginContainer.style.display = 'none';
}

// 加入聊天室
function joinChat() {
  username = usernameInput.value.trim();
  if (username) {
    socket.emit('join', username);
    hideLoginForm();
    messageInput.focus();
  } else {
    alert('请输入昵称!');
  }
}

// 处理表情符号
function replaceEmojis(text) {
  let processedText = text;
  for (const code in emojis) {
    const regex = new RegExp(code.replace(/([.*+?^=!:${}()|[\]\\])/g, '\\$1'), 'g');
    processedText = processedText.replace(regex, emojis[code]);
  }
  return processedText;
}

// 发送消息
function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    socket.emit('sendMessage', message);
    messageInput.value = '';
  }
}

// 添加消息到聊天容器
function addMessageToChat(message) {
  const messageElement = document.createElement('div');
  
  // 根据消息类型设置样式
  if (message.user === 'system') {
    messageElement.className = 'message system';
    messageElement.textContent = message.text;
  } else {
    const isCurrentUser = message.user === username;
    messageElement.className = `message ${isCurrentUser ? 'self' : 'other'}`;
    
    const userElement = document.createElement('div');
    userElement.className = 'user';
    userElement.textContent = message.user;
    
    const textElement = document.createElement('div');
    // 处理消息中的表情符号
    textElement.textContent = replaceEmojis(message.text);
    
    const timeElement = document.createElement('div');
    timeElement.className = 'time';
    timeElement.textContent = message.time;
    
    messageElement.appendChild(userElement);
    messageElement.appendChild(textElement);
    messageElement.appendChild(timeElement);
  }
  
  chatContainer.appendChild(messageElement);
  
  // 滚动到最新消息
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

// 创建表情选择器
function createEmojiPicker() {
  if (document.getElementById('emoji-picker')) return;
  
  const emojiPickerContainer = document.createElement('div');
  emojiPickerContainer.id = 'emoji-picker';
  emojiPickerContainer.className = 'emoji-picker';
  emojiPickerContainer.style.display = 'none';
  
  for (const code in emojis) {
    const emojiButton = document.createElement('button');
    emojiButton.className = 'emoji-button';
    emojiButton.textContent = emojis[code];
    emojiButton.title = code;
    emojiButton.addEventListener('click', (e) => {
      e.stopPropagation();
      addEmojiToInput(code);
      toggleEmojiPicker();
    });
    emojiPickerContainer.appendChild(emojiButton);
  }
  
  document.querySelector('.input-area').appendChild(emojiPickerContainer);
}

// 显示表情选择器
function toggleEmojiPicker() {
  let emojiPicker = document.getElementById('emoji-picker');
  const emojiButton = document.querySelector('.emoji-toggle');
  
  if (!emojiPicker) {
    createEmojiPicker();
    emojiPicker = document.getElementById('emoji-picker');
  }
  
  const currentDisplay = emojiPicker.style.display;
  if (currentDisplay === 'none' || currentDisplay === '') {
    const buttonRect = emojiButton.getBoundingClientRect();
    emojiPicker.style.display = 'flex';
    emojiPicker.style.position = 'absolute';
    emojiPicker.style.top = `${buttonRect.top - emojiPicker.offsetHeight - 5}px`;
    emojiPicker.style.left = `${buttonRect.left - 140}px`; // 向左偏移140px使其居中对齐
    
    // 添加点击外部关闭事件
    setTimeout(() => {
      document.addEventListener('click', closeEmojiPickerOnClickOutside);
    }, 0);
  } else {
    emojiPicker.style.display = 'none';
    document.removeEventListener('click', closeEmojiPickerOnClickOutside);
  }
}

function closeEmojiPickerOnClickOutside(event) {
  const emojiPicker = document.getElementById('emoji-picker');
  const emojiButton = document.querySelector('.emoji-toggle');
  
  if (emojiPicker && !emojiPicker.contains(event.target) && event.target !== emojiButton) {
    emojiPicker.style.display = 'none';
    document.removeEventListener('click', closeEmojiPickerOnClickOutside);
  }
}

// 添加表情到输入框
function addEmojiToInput(emoji) {
  messageInput.value += emoji;
  messageInput.focus();
}

// 切换深色模式
function toggleDarkMode() {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', isDarkMode);
  themeToggleButton.textContent = isDarkMode ? '切换浅色模式' : '切换深色模式';
}

// 检查用户偏好设置
function checkThemePreference() {
  const isDarkMode = localStorage.getItem('darkMode') === 'true';
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
    themeToggleButton.textContent = '切换浅色模式';
  }
}

// 事件监听
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

// 添加input事件监听器，实时转换表情代码为emoji
messageInput.addEventListener('input', () => {
  const cursorPosition = messageInput.selectionStart;
  const originalValue = messageInput.value;
  messageInput.value = replaceEmojis(originalValue);
  messageInput.setSelectionRange(cursorPosition, cursorPosition);
});

loginButton.addEventListener('click', joinChat);

usernameInput.addEventListener('keypress', (event) => {
  if (event.key === 'Enter') {
    joinChat();
  }
});

cancelButton.addEventListener('click', () => {
  usernameInput.value = '';
});

themeToggleButton.addEventListener('click', toggleDarkMode);

// 用户列表
const usersList = document.getElementById('users-list');

// 更新用户列表
function updateUsersList(users) {
  usersList.innerHTML = '';
  users.forEach(user => {
    const li = document.createElement('li');
    li.textContent = user.username;
    usersList.appendChild(li);
  });
}

// Socket.io事件监听
socket.on('message', (message) => {
  // 如果是系统消息且内容是清空聊天记录的通知，则清空聊天容器
  if (message.user === 'system' && message.text === '管理员已清空聊天记录') {
    chatContainer.innerHTML = '';
    addMessageToChat(message); // 只在清空后添加系统消息
  } else {
    addMessageToChat(message); // 处理其他消息
  }
});

// 接收历史消息
socket.on('historicalMessages', (messages) => {
  messages.forEach(message => {
    addMessageToChat(message);
  });
});

socket.on('userJoined', (data) => {
  updateUsersList(data.users);
});

socket.on('userLeft', (data) => {
  updateUsersList(data.users);
});

// 页面加载时显示登录框并检查主题偏好
showLoginForm();
checkThemePreference();
