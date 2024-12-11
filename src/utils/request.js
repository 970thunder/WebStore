//定制请求的实例

//导入axios  npm install axios
import axios from 'axios';
import { ElMessage } from 'element-plus';
//定义一个变量,记录公共的前缀  ,  baseURL
// const baseURL = 'http://localhost:8080';
const baseURL = '/api';

const instance = axios.create({ baseURL })


import { useTokenStore } from '@/stores/token.js'
//添加请求拦截器
instance.interceptors.request.use(
    (config) => {
        //给请求头添加token
        const tokenStore = useTokenStore();
        //判断token是否存在
        if (tokenStore.token) {
            //如果存在,给请求头添加token
            config.headers.Authorization = tokenStore.token;
        }
        return config;
    },
    (err) => {
        Promise.reject(err);
    }
)

import router from '@/router'
//添加响应拦截器
instance.interceptors.response.use(
    result => {
        // 判断返回的状态码
        if (result.data.code === 0) {
            return result.data;
        }

        // 操作失败
        ElMessage.error(result.data.msg ? result.data.msg : '服务异常')
        // 异步的状态转化成失败的状态
        return Promise.reject(result.data);
    },
    err => {
        // 如果响应状态码是401，代表未登录，给出对应的提示，并跳转到登录页
        if (err.response.status === 401) {
            ElMessage.error('请先登录！');
            router.push('/Admin/login')
        } else {
            ElMessage.error('服务异常');
        }
        return Promise.reject(err); // 异步的状态转化成失败的状态
    }
)

export default instance;