<template>
    <div class="chat-log-container">
        <el-container>
            <el-aside width="15vw" style="background-color: white">
                <el-button class="dialog-button" @click="addDialogInfo()" type="primary" plain>新建对话</el-button>

                <!-- 判断是否有对话数据 -->
                <el-empty v-if="conversations.length === 0">
                    <img class="empty-img" src="" alt="无数据" />
                </el-empty>

                <!-- 显示对话列表 -->
                <el-button class="conversation-button" v-for="conversation in conversations"
                    :key="conversation.conversationId" type="text"
                    @click="getChatLogsByConversationId(conversation.conversationId)">
                    {{ conversation.conversationName }}
                </el-button>

            </el-aside>
            <el-container class="chat-log-all">
                <el-main ref="middle" class="chat-log-body">
                    <ul class="chat-log-list">
                        <li v-for="chatLog in chatLogs" :key="chatLog.messageId" class="chat-log-list-li">
                            <!-- AI 对话框 -->
                            <div v-if="chatLog.role === 0" class="chat-log-list-li-ai">
                                <img class="chat-log-model-img" src="../../../assets/Admin_images/model.png"
                                    alt="模型显示头像" />
                                <div class="ai-message">
                                    <p class="show-p">{{ chatLog.content }}</p>
                                </div>
                            </div>
                            <!-- 用户对话框 -->
                            <div v-if="chatLog.role === 1" class="chat-log-list-li-user">
                                <div class="user-message">
                                    <p class="show-p">{{ chatLog.content }}</p>
                                </div>
                                <el-avatar class="chat-log-user-img"
                                    :src="userInfoStore.info.userPic ? userInfoStore.info.userPic : avatar" />
                            </div>
                        </li>
                    </ul>



                </el-main>
                <el-footer>
                    <div class="chat-log-input">
                        <el-input v-model="inputInfo" type="textarea" @input="adjustHeight"
                            :style="{ height: textareaHeight + 'px', maxHeight: '200px' }" @keydown="handleKeydown"
                            placeholder="请输入内容" class="chat-log-input-set" resize="none" />

                        <!-- 图片选择按钮 -->
                        <el-upload class="chat-log-upload" action="" :show-file-list="false"
                            :before-upload="beforeUpload" :on-success="handleUploadSuccess" accept="image/*">
                            <el-button type="text">@</el-button>
                        </el-upload>

                        <el-button class="add-chat-log" :disabled="buttonDisabled" @click="submitInputInfo()">
                            <span>发送信息</span>
                        </el-button>
                    </div>

                </el-footer>
            </el-container>
        </el-container>
    </div>
</template>

<script setup>
import '@/assets/el.css';

import { reactive, ref } from 'vue';
import chatLogApi from '@/api/front/chatLog.js';
import { ElMessage } from 'element-plus';
import { getConversationsByOpenId, addConversation, getChatLogByConversationId, addMessage } from '@/api/front/chatLog.js';

const chatLogs = reactive([]); // 聊天记录
const inputInfo = ref(''); // 用户输入
const buttonDisabled = ref(false); // 按钮状态
const imageUrl = ref(null); // 用于存储上传的图片URL
//存储聊天记录
const message = {
    conversationId: null,
    role: null,
    content: ''
}

//导入接口函数
import { userInfoGetService } from '@/api/user.js'
//导入pinia
import { useUserInfoStore } from '@/stores/userInfo.js'
import { useTokenStore } from '@/stores/token.js'
const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();

//获取个人信息
const getUserInfo = async () => {
    try {
        let result = await userInfoGetService();
        //存储pinia
        userInfoStore.info = result.data;
    } catch (error) {
        console.error('Failed to get user info:', error);
        if (error.response && error.response.status === 401) {
            // 处理401未授权错误
            ElMessage.error('身份验证失败，请重新登录');
            tokenStore.removeToken();
            userInfoStore.removeInfo();
            router.push('/Admin/login');
        } else {
            ElMessage.error('获取用户信息失败');
        }
    }
}
getUserInfo()


// 定义对话列表
const conversations = reactive([]); // 对话列表
// 获取所有对话
const getConversations = async () => {
    try {
        const response = await getConversationsByOpenId(userInfoStore.info.id + '123'); // 获取对话列表
        if (response.code === 0) {
            conversations.push(...response.data); // 添加到 conversations
        } else {
            ElMessage.error('获取对话列表失败');
        }
    } catch (error) {
        console.error('获取对话列表失败:', error);
        ElMessage.error('获取对话列表失败');
    }
};

const getChatLogsByConversationId = async (conversationId) => {
    try {
        const chatLogsData = await getChatLogByConversationId(conversationId);
        message.conversationId = conversationId;
        if (chatLogsData.code === 0) {
            chatLogs.length = 0; // 清空聊天记录
            chatLogs.push(...chatLogsData.data); // 添加新的聊天记录

            console.log('获取到的聊天记录：', chatLogsData);
            console.log('当前聊天记录：', chatLogs);
        }
    } catch (error) {
        console.error('获取聊天记录失败:', error);
        ElMessage.error('聊天记录为空');
    }
};




getConversations();



// 添加新对话
const addDialogInfo = async () => {
    // 自动生成对话名称
    let conversationName = '新聊天';
    let counter = 1;

    // 检查是否有同名对话，直到生成唯一名称
    while (conversations.some(convo => convo.conversationName === conversationName)) {
        conversationName = `新聊天${counter}`;
        counter++;
    }

    try {
        const response = await addConversation({
            userId: userInfoStore.info.id,
            openId: userInfoStore.info.id + '123',
            conversationName: conversationName
        });
        if (response.code === 0) {
            conversations.length = 0; // 清空对话列表
            // 刷新对话列表
            await getConversations(); // 等待获取最新的对话列表

            ElMessage.success('新建对话成功');
        } else {
            ElMessage.error('新建对话失败');
        }
    } catch (error) {
        console.error('新建对话失败:', error);
        ElMessage.error('新建对话失败');
    }
};


// 监听用户输入，按下Shift+Enter时，不换行，按下Enter时触发提交消息
const handleKeydown = (event) => {
    if (event.key === 'Enter') {
        // 如果按下的是 Shift + Enter，则换行
        if (event.shiftKey) {
            // 默认行为是换行，不做任何处理
        } else {
            // 否则执行发送消息
            event.preventDefault(); // 阻止换行
            submitInputInfo();
        }
    }
};

// 提交用户输入
const submitInputInfo = async () => {
    if (!inputInfo.value && !imageUrl.value) {
        ElMessage({ message: '发送信息不能为空', type: 'error' });
        return;
    }
    buttonDisabled.value = true;

    // 判断是文字还是图片消息
    const messageType = imageUrl.value ? 'image' : 'text';
    const messageContent = imageUrl.value || inputInfo.value;


    // 添加用户消息到聊天记录
    // chatLogs.push({
    //     id: Date.now(),
    //     content: inputInfo.value,
    //     sayObject: '1'
    // });
    chatLogs.push({ messageId: Date.now(), content: messageContent, role: 1, type: messageType });
    console.log('当前发送：', chatLogs);
    const userInput = inputInfo.value;
    inputInfo.value = ''; // 清空输入框

    // 准备发送的数据
    // const payload = {
    //     content: userInput,
    //     source: 'nbRO7kOG0OnS0juN4bT3iSGgYGhFWdZ3', // 固定值
    //     openId: userInfoStore.info.id + '123' // openId确定用户唯一性，每个用户唯一值（用户id是唯一的）
    // };
    const payload = {
        content: messageContent,
        type: messageType,
        source: '674puEMCuRgfIfSrZqFFkITHSfSzXJgi',
        openId: userInfoStore.info.id + '123',
        mediaUrl: imageUrl.value || null, // 只有图片消息才有这个字段
    };

    // //将当前对话ID赋值给消息体
    message.role = 1;
    message.content = messageContent;
    addMessage(message);

    try {
        const response = await chatLogApi.sendMessage(payload);
        console.log('Full response:', response);

        const botResponse = response.responseData;
        if (botResponse) {
            chatLogs.push({ messageId: Date.now(), content: response.responseData, role: 0, type: messageType });
            message.role = 0;
            message.content = response.responseData;
            addMessage(message);
        } else {
            throw new Error('Response does not contain responseData');
        }
    } catch (error) {
        console.error('error:', error);
        ElMessage({ message: '发送失败', type: 'error' });
    } finally {
        buttonDisabled.value = false;
    }
};

// 上传图片处理
const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
        ElMessage.error('请上传图片文件');
    }
    return isImage;
};

const handleUploadSuccess = (response, file, fileList) => {
    imageUrl.value = response.url; // 假设服务器返回图片URL
    console.log('上传成功:', response);
};
</script>


<style scoped>
.chat-log-container {
    /* 宽度和高度 */
    width: 99%;
    height: 100%;
    /* 背景颜色 */
}

/* 聊天记录展示区域的主容器 */
.chat-log-all {
    /* 固定高度 */
    height: 83.1vh;
    /* 绘制上方下方和右边的边框 */
    border-top: 1px solid #f5f5f5;
    border-bottom: 1px solid #e4e4e4;
    border-right: 1px solid #e4e4e4;
    /* 半透明边框阴影 */
    box-shadow: 10px 5px 10px rgba(0, 0, 0, 0.1);

}

/* 聊天列表ul样式设置 */
.chat-log-list {
    /* 去除ul默认的padding */
    padding: 0px;
}

/* 输入框框架样式 */
.chat-log-input {
    display: flex;
    align-items: center;
}

/* 输入框样式 */
.chat-log-input-set {
    /* 长度限制 */
    width: 90%;
    display: flex;
}

/* 按钮样式 */
.add-chat-log {
    margin-left: 10px;
    border: none;
    height: 45px;
    width: 95px;
}

/* 以列表形式展示聊天记录和头像 */
.chat-log-list-li {
    list-style: none;
    margin: 10px 0;
    display: flex;
    align-items: flex-start;
}

/* ai 的对话框，头像和文字靠左 */
.chat-log-list-li-ai {
    display: flex;
    justify-content: flex-start;
}

/* 用户的对话框，头像和文字靠右 */
.chat-log-list-li-user {
    display: flex;
    justify-content: flex-end;
    /* 用户文本居右 */
    margin-left: auto;
}

/* 模型头像 */
.chat-log-model-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-right: 5px;
    padding: 5px;
}

/* 用户头像 */
.chat-log-user-img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    margin-left: 10px;
    margin-right: 10px;
}


/* ai消息框 */
.ai-message {
    background-color: #716777;
    padding: 10px;
    border-radius: 10px;
    max-width: 70%;
    text-align: left;
}

/* 用户消息框 */
.user-message {
    background-color: #716777;
    padding: 10px;
    border-radius: 10px;
    max-width: 90%;

}

/* 消息文字样式 */
.show-p {
    color: #fff4e4;
    margin: 0;
    white-space: pre-wrap;
}

/* 对话列表按钮样式 */
.conversation-button {
    display: block;
    width: 95%;
    padding: 2vh;
    height: auto;
    border: px solid #f0f0f0;
    margin: 5px 5px;
}

.conversation-button:hover {
    background-color: #e3e3e3;
}

.el-aside {
    max-height: 83vh;
    overflow-y: auto;
    scroll-behavior: smooth;
    /* 平滑滚动 */
    /* 滚动条默认不显示 */
    scrollbar-width: none;
    /* 阴影效果 */
    box-shadow: 3px 5px 10px rgba(0, 0, 0, 0.1);
}

/* 新建对话按钮*/
.dialog-button {
    display: block;
    height: auto;
    /* 水平居中 */
    margin-left: 1vh;
    margin-top: 1vh
}

/* 为空数据时的显示样式 */
.empty-img {
    width: 100%;
}

.chat-log-body {
    background-color: #f5f7ff;
}

.el-footer {
    background-color: #f5f7ff;
}


/* ############所有布局边框，仅供排版布局时开启，不使用时注释掉################### */
/* .el-aside {
    border: 5px solid #ff0000;
}

.chat-log-all {
    border: 5px solid #ffc400;
}



.ai-message {
    border: 5px solid #00ffbf;
}

.user-message {
    border: 5px solid #ff00b3;
}

 */
</style>
