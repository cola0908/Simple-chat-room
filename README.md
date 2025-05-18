#简易聊天室 

---

**一个简易聊天室，十分小的占用空间，可以快速部署，功能简单！**

优点：流畅的动画，简洁的界面，socket.io实时通信，深色模式浅色模式切换，违禁词，后台管理

**部署教程：**

    开发环境：

        git，nodejs

    windows：

        git clone该项目：

```git
    git clone https://github.com/cola0908/Simple-chat-room.git 
```

        cd项目目录中的chatroom文件夹

        运行该项目：

```nodejs
    node server.js
```

        默认地址： http://localhost/

        默认后台地址：[http://localhost/admin.html](http://localhost/admin.html)

        默认后台账号密码：

            账号：admin

            密码：admin123

**如何修改关键内容：**

    网页标题：

        /chatroom/public/index.html

        第391行

```html
    <span>简易聊天室</span>
```

    标签页标题：

        /chatroom/public/index.html

        第6行

```html
    <title>简易聊天室</title>
```

     后台账号密码：

        /chatroom/public/admin.html

        第199-122行

```html
    <!-- 用户名 -->
    const ADMIN_USERNAME = 'admin';
	<!-- 密码 -->
    const ADMIN_PASSWORD = 'admin123';
```


