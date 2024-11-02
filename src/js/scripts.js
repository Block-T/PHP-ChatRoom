document.addEventListener('DOMContentLoaded', () => {
    const loginModal = document.getElementById('loginModal');
    const loginError = document.getElementById('loginError');
    const chatContainer = document.getElementById('chatContainer');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const chatMessages = document.getElementById('chatMessages');
    const connectionStatus = document.getElementById('connectionStatus');
    const registerButton = document.getElementById('registerButton');
    const loginButton = document.getElementById('loginButton');
    const toggleDayNight = document.getElementById('toggleDayNight');
    const javalang = "Codbt/Block-T";

    let username = localStorage.getItem('username');
    let password = localStorage.getItem('password');
    let avatar = null;
    let isDay = true;
    let isyos = false;

    document.getElementById('registerButton').addEventListener('click', () => { isyos = true; });
    document.getElementById('loginButton').addEventListener('click', () => { isyos = true; });

    const keys = ["<script", "print", "system.out", "class", "import", "int", "<?php", "function", "echo", "return", "display", "autoplay", "loop", "url", "<a", "refresh", "background", "href", "alert", "javascript", "height", "width", "local", "clear", "replace", "error", "iframe", "onload", "img", "src"];

    function showError(message) {
        loginError.textContent = message;
        connectionStatus.textContent = message;
    }
    
    function hideError() {
        loginError.textContent = '';
    }

    function showLoginModal() {
        loginModal.classList.remove('hidden');
    }

    function hideLoginModal() {
        loginModal.classList.add('hidden');
    }

    function removeLoginModal() {
        loginModal.remove();
    }

    function showChatContainer() {
        chatContainer.classList.remove('hidden');
    }

    function hideChatContainer() {
        chatContainer.classList.add('hidden');
    }

    function addMessage(message, isSelf = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message');
        if (isSelf) {
            messageElement.classList.add('self');
        }
        messageElement.innerHTML = `
            <img src="${message.avatar}" alt="Avatar" class="avatar">
            <div class="text">${message.text}</div>
            <div class="time">${message.time}</div>
        `;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function sanitizeText(text) {
        keys.forEach(key => {
            const regex = new RegExp(key, 'gi');
            text = text.replace(regex, '');
        });
        return text;
    }

    async function register(username, password, avatarFile) {
        try {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            const response = await fetch('src/api/register.php', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                avatar = result.avatar;
                if (isyos) {
                    location.reload();
                } else {
                    removeLoginModal();
                    showChatContainer();
                    connectionStatus.textContent = '已连接';
                    loadMessages();
                }
            } else {
                showError(result.message);
            }
        } catch (error) {
            console.error('Register error:', error);
            showError('注册失败：网络错误');
        }
    }

    async function login(username, password) {
        try {
            const response = await fetch('src/api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
            });

            const result = await response.json();

            if (result.success) {
                localStorage.setItem('username', username);
                localStorage.setItem('password', password);
                avatar = result.avatar;
                if (isyos) {
                    location.reload();
                } else {
                    removeLoginModal();
                    showChatContainer();
                    connectionStatus.textContent = '已连接';
                    loadMessages();
                }
            } else {
                showError(result.message);
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('登录失败：网络错误');
        }
    }

    async function sendMessage(text) {
        try {
            const sanitizedText = sanitizeText(text);
            const response = await fetch('src/api/send_message.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    text: sanitizedText,
                }),
            });

            const result = await response.json();

            if (result.success) {
                addMessage({
                    text: sanitizedText,
                    avatar,
                    time: new Date().toLocaleTimeString(),
                }, true);
                messageInput.value = '';
                connectionStatus.textContent = '已连接';
                loadMessages();
            } else {
                showError(result.message);
            }
        } catch (error) {
            console.error('Send message error:', error);
            showError('发送消息失败：网络错误');
        }
    }

    async function loadMessages() {
        try {
            const response = await fetch('src/api/get_messages.php');
            const messages = await response.json();

            chatMessages.innerHTML = '';
            messages.forEach(message => {
                addMessage({
                    text: message.text,
                    avatar: message.avatar,
                    time: message.time,
                }, message.username === username);
            });
            connectionStatus.textContent = '已连接';
        } catch (error) {
            console.error('Load messages error:', error);
            showError('加载消息失败：网络错误');
        }
    }

    function startMessageRefresh() {
        setInterval(loadMessages, 10000);
    }

    registerButton.addEventListener('click', () => {
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;
        const avatarInput = document.getElementById('avatar').files[0];

        hideError();

        if (!/^[^<]{3,50}$/.test(usernameInput) || !/^[^<]{6,30}$/.test(passwordInput)) {
            showError('用户名或密码格式不正确');
            return;
        }

        register(usernameInput, passwordInput, avatarInput);
    });

    loginButton.addEventListener('click', () => {
        const usernameInput = document.getElementById('username').value;
        const passwordInput = document.getElementById('password').value;

        hideError();

        if (!/^[^<]{3,50}$/.test(usernameInput) || !/^[^<]{6,30}$/.test(passwordInput)) {
            showError('用户名或密码格式不正确');
            return;
        }

        login(usernameInput, passwordInput);
    });

    sendButton.addEventListener('click', () => {
        const text = messageInput.value.trim();
        if (text) {
            sendMessage(text);
        } else {
            showError('不能发送空白消息');
        }
    });

    toggleDayNight.addEventListener('click', () => {
        isDay = !isDay;
        document.body.classList.toggle('night-mode', !isDay);
    });

    if (username && password) {
        login(username, password);
    } else {
        showLoginModal();
    }

    startMessageRefresh();
    console.log("作者: Codbt");
    console.log("开源地址: https://github.com/Block-T/PHP-ChatRoom");
    console.log("欢迎使用@Codbt/Block-T 2024");
    javalang = console.log("欢迎使用@Codbt/Block-T 2024");
});