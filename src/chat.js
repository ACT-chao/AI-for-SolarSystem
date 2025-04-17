import OpenAI from 'openai';

class ChatManager {
    constructor() {
        this.messages = [];
        this.apiKey = localStorage.getItem('openai_api_key') || '';
        this.apiUrl = localStorage.getItem('openai_api_url') || 'https://api.deepseek.com';
        this.model = localStorage.getItem('openai_model') || 'deepseek-chat';
        
        this.openai = null;
        this.setupOpenAI();
        this.setupUI();
        this.setupEventListeners();
        this.loadMessages();
    }

    setupOpenAI() {
        if (this.apiKey) {
            this.openai = new OpenAI({
                baseURL: this.apiUrl,
                apiKey: this.apiKey,
                dangerouslyAllowBrowser: true
            });
        }
    }

    setupUI() {
        // 创建切换按钮
        const toggleButton = document.createElement('button');
        toggleButton.className = 'chat-toggle';
        toggleButton.innerHTML = '&#x1F4AC;';
        document.body.appendChild(toggleButton);

        // 创建聊天侧边栏
        const sidebar = document.createElement('div');
        sidebar.className = 'chat-sidebar';
        sidebar.innerHTML = `
            <div class="chat-header">
                <h2>AI 助手</h2>
                <div class="header-buttons">
                    <button class="clear-button" title="清除历史">&#x1F5D1;</button>
                    <button class="settings-button" title="设置">&#x2699;</button>
                </div>
            </div>
            <div class="chat-messages"></div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" placeholder="输入你的消息...">
                <button class="send-button">发送</button>
            </div>
        `;
        document.body.appendChild(sidebar);

        // 创建设置模态框
        const modal = document.createElement('div');
        modal.className = 'settings-modal';
        modal.innerHTML = `
            <form class="settings-form">
                <div class="form-group">
                    <label for="api-key">API 密钥</label>
                    <input type="password" id="api-key" value="${this.apiKey}">
                </div>
                <div class="form-group">
                    <label for="api-url">API 地址</label>
                    <input type="text" id="api-url" value="${this.apiUrl}">
                </div>
                <div class="form-group">
                    <label for="model">模型</label>
                    <input type="text" id="model" value="${this.model}">
                </div>
                <div class="settings-buttons">
                    <button type="button" class="cancel-button">取消</button>
                    <button type="submit" class="save-button">保存</button>
                </div>
            </form>
        `;
        document.body.appendChild(modal);

        // 创建模态框遮罩层
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        document.body.appendChild(overlay);

        // 存储DOM元素
        this.elements = {
            messagesContainer: sidebar.querySelector('.chat-messages'),
            input: sidebar.querySelector('.chat-input'),
            sendButton: sidebar.querySelector('.send-button'),
            settingsButton: sidebar.querySelector('.settings-button'),
            clearButton: sidebar.querySelector('.clear-button'),
            modal,
            overlay,
            settingsForm: modal.querySelector('.settings-form'),
            cancelButton: modal.querySelector('.cancel-button'),
            toggleButton,
            sidebar
        };
    }

    setupEventListeners() {
        // 切换聊天窗口
        this.elements.toggleButton.addEventListener('click', () => {
            this.elements.sidebar.classList.toggle('active');
        });

        // 发送消息
        this.elements.sendButton.addEventListener('click', () => this.sendMessage());
        this.elements.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // 设置模态框
        this.elements.settingsButton.addEventListener('click', () => this.openSettings());
        this.elements.cancelButton.addEventListener('click', () => this.closeSettings());
        this.elements.overlay.addEventListener('click', () => this.closeSettings());
        this.elements.settingsForm.addEventListener('submit', (e) => this.saveSettings(e));

        // 处理清除历史按钮点击
        this.elements.clearButton.addEventListener('click', () => this.clearHistory());

        // 处理 Ask AI 事件
        window.addEventListener('askAI', async (event) => {
            // 显示聊天窗口
            this.elements.sidebar.classList.add('active');
            
            // 添加用户消息
            this.addMessage(event.detail, 'user');

            try {
                if (!this.apiKey) {
                    throw new Error('请先在设置中配置API密钥');
                }

                // 直接调用API
                const response = await this.callAPI(event.detail);
                
                // 添加AI响应到聊天记录
                this.addMessage(response, 'ai');
            } catch (error) {
                console.error('Error:', error);
                this.addMessage(`错误: ${error.message}`, 'ai');
            }
        });
    }

    async sendMessage() {
        const message = this.elements.input.value.trim();
        if (!message) return;

        // 清空输入框
        this.elements.input.value = '';

        // 添加用户消息到聊天记录
        this.addMessage(message, 'user');

        try {
            if (!this.apiKey) {
                throw new Error('请先在设置中配置API密钥');
            }

            // 发送到API（现在会自动处理流式输出）
            await this.callAPI(message);
        } catch (error) {
            console.error('Error:', error);
            this.addMessage(`错误: ${error.message}`, 'ai');
        }
    }

    addMessage(text, type) {
        const message = { text, type, timestamp: new Date().toISOString() };
        
        // 如果不是流式输出的消息，添加到历史记录
        if (!(type === 'ai' && typeof text === 'object')) {
            this.messages.push(message);
            this.saveMessages();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}-message`;
        
        if (type === 'ai' && typeof text === 'object') {
            // 如果是流式输出，创建一个空的消息元素
            messageElement.textContent = '';
            this.elements.messagesContainer.appendChild(messageElement);
            return messageElement;
        } else {
            messageElement.textContent = text;
            this.elements.messagesContainer.appendChild(messageElement);
            this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
        }
    }

    saveMessages() {
        // 只保存最近的50条消息
        const recentMessages = this.messages.slice(-50);
        localStorage.setItem('chat_messages', JSON.stringify(recentMessages));
    }

    loadMessages() {
        try {
            const savedMessages = localStorage.getItem('chat_messages');
            if (savedMessages) {
                const messages = JSON.parse(savedMessages);
                messages.forEach(msg => {
                    const messageElement = document.createElement('div');
                    messageElement.className = `message ${msg.type}-message`;
                    messageElement.textContent = msg.text;
                    this.elements.messagesContainer.appendChild(messageElement);
                });
                this.messages = messages;
                this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    async callAPI(message) {
        try {
            if (!this.openai) {
                this.setupOpenAI();
                if (!this.openai) {
                    throw new Error('请先在设置中配置API密钥');
                }
            }

            const stream = await this.openai.chat.completions.create({
                messages: [{ role: "user", content: message }],
                model: this.model,
                stream: true,
            });

            // 创建一个消息元素用于流式输出
            const messageElement = this.addMessage({ streaming: true }, 'ai');
            let fullText = '';

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content || '';
                fullText += content;
                messageElement.textContent = fullText;
                this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
            }

            // 更新消息历史
            this.messages[this.messages.length - 1].text = fullText;
            this.saveMessages();

            return fullText;
        } catch (error) {
            console.error('API Error:', error);
            throw new Error(error.message);
        }
    }

    openSettings() {
        this.elements.modal.classList.add('active');
        this.elements.overlay.classList.add('active');
    }

    closeSettings() {
        this.elements.modal.classList.remove('active');
        this.elements.overlay.classList.remove('active');
    }

    saveSettings(e) {
        e.preventDefault();
        
        // 获取值
        const apiKey = document.getElementById('api-key').value.trim();
        const apiUrl = document.getElementById('api-url').value.trim();
        const model = document.getElementById('model').value.trim();

        if (!apiKey) {
            alert('API密钥不能为空');
            return;
        }

        if (!apiUrl) {
            alert('API地址不能为空');
            return;
        }

        if (!model) {
            alert('模型名称不能为空');
            return;
        }

        // 保存到localStorage
        localStorage.setItem('openai_api_key', apiKey);
        localStorage.setItem('openai_api_url', apiUrl);
        localStorage.setItem('openai_model', model);

        // 更新实例变量
        this.apiKey = apiKey;
        this.apiUrl = apiUrl;
        this.model = model;

        // 设置OpenAI实例
        this.setupOpenAI();

        // 关闭模态框
        this.closeSettings();
        
        // 显示成功消息
        this.addMessage('设置已保存', 'ai');
    }

    clearHistory() {
        // 清除本地存储
        localStorage.removeItem('chat_messages');
        
        // 清除内存中的消息
        this.messages = [];
        
        // 清除界面显示
        this.elements.messagesContainer.innerHTML = '';
        
        // 添加一条提示消息
        this.addMessage('历史对话已清除', 'ai');
    }

    sendToAI(message) {
        this.sendMessage(message);
    }
}

export default ChatManager;
