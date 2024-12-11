import axios from 'axios';
import request from '@/utils/request.js'
import { useTokenStore } from '@/stores/token.js'

const chatLogApi = {

    sendMessage(payload) {
        const token = localStorage.getItem('token'); // 假设从 localStorage 中取令牌
        return axios.post('/api/chat/send', payload, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }).then(response => response.data)
            .catch(error => {
                console.error('发送消息失败:', error);
                throw error;
            });
    }
    
};

// 获取指定 OpenId 的所有对话
export const getConversationsByOpenId = (openId) => {
    return request.get(`/conversations/getAllByOpenId`, { params: { openId } }); // 根据 openId 查询对话列表
};


export const addConversation = (condata) => {
    return request.post('/conversations/addConversation', condata); // 添加对话
}

export const getChatLogByConversationId = (conversationId) => {
    return request.get(`/message/${conversationId}`);
};

export const addMessage = (message) => {
    return request.post('/message/add', message); // 添加消息
}

export default chatLogApi;
