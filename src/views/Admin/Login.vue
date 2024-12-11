<script setup>
import { User, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus';
import { ref } from 'vue'
//控制注册与登录表单的显示， 默认显示登录
const isRegister = ref(false)

//定义数据模型
const registerData = ref({
    username: '',
    nickname: '',
    password: '',
    email: '',
    repassword: ''
})

// 新增rememberMe变量来记录“记住我”的状态
const rememberMe = ref(false);

//校验密码是否一致
const checkRePassword = (rule, value, callback) => {
    if (value === '') {
        callback(new Error('请再次输入密码'))
    } else if (value !== registerData.value.password) {
        callback(new Error('两次密码不一致'))
    } else {
        callback()
    }
}

//定义表单校验规则
const rules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' },
        { min: 5, max: 16, message: '用户名长度在5-16非空字符', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        { min: 5, max: 16, message: '用户名长度在5-16非空字符', trigger: 'blur' }
    ],
    repassword: [
        { validator: checkRePassword, trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱', trigger: 'blur' },
        { type: 'email', message: '请输入有效的邮箱地址', trigger: ['blur', 'change'] }
    ]
}

//调用后台接口完成注册
import { userRegisterService, userLoginService } from '@/api/user.js'
const register = async () => {
    let result = await userRegisterService(registerData.value);
    if (result.code === 0) {
        ElMessage.success(result.msg ? result.msg : '注册成功');
        isRegister.value = false;
        //可以在这里清空注册数据（此处不选，便于直接登录）
        // clearRegisterData();
    } else {
        ElMessage.error('注册失败');
    }
}

import { useTokenStore } from '@/stores/token.js'
import { useRouter } from 'vue-router'

const router = useRouter()
const tokenStore = useTokenStore();
//登录复用注册表单的模型和表单校验
//登录函数
const login = async () => {
    let result = await userLoginService(registerData.value);
    if (result.code === 0) {
        ElMessage.success(result.msg ? result.msg : '登录成功');
        tokenStore.setToken(result.data)
        router.push('/Admin/good')

        // 如果“记住我”被选中，保存用户名和密码到localStorage
        if (rememberMe.value) {
            localStorage.setItem('username', registerData.value.username);
            localStorage.setItem('password', registerData.value.password);
        }
    } else {
        ElMessage.error('登录失败');
    }
}

//清空模型数据
const clearRegisterData = () => {
    registerData.value = {
        username: '',
        nickname: '',
        password: '',
        email: '',
        repassword: ''
    }
}

// 读取localStorage中的用户名和密码，填充到表单中
const readLocalStorage = () => {
    // 读取localStorage中的用户名和密码
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');
    if (username && password) {
        // 填充表单
        registerData.value.username = username;
        registerData.value.password = password;
        // 选中“记住我”
        rememberMe.value = true;
    }
}

readLocalStorage();
</script>

<template>
    <el-row class="login-page">
        <el-col :span="12" class="bg"></el-col>
        <el-col :span="6" :offset="3" class="form">
            <!-- 注册表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-if="isRegister" :model="registerData"
                class="translucent-form" :rules="rules">
                <el-form-item>
                    <h1>注册</h1>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registerData.username"></el-input>
                </el-form-item>
                <el-form-item prop="nickname">
                    <el-input :prefix-icon="User" placeholder="请输入昵称（非必填）" v-model="registerData.nickname"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input :prefix-icon="Lock" type="password" placeholder="请输入密码"
                        v-model="registerData.password"></el-input>
                </el-form-item>
                <el-form-item prop="repassword">
                    <el-input :prefix-icon="Lock" type="password" placeholder="请输入再次密码"
                        v-model="registerData.repassword"></el-input>
                </el-form-item>
                <el-form-item prop="email">
                    <el-input placeholder="请输入邮箱" v-model="registerData.email"></el-input>
                </el-form-item>
                <!-- 注册按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="register">
                        注册
                    </el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" :underline="false" @click="isRegister = false; clearRegisterData()">
                        ← 返回
                    </el-link>
                </el-form-item>
            </el-form>
            <!-- 登录表单 -->
            <el-form ref="form" size="large" autocomplete="off" v-else :model="registerData" class="translucent-form"
                :rules="rules">
                <el-form-item>
                    <h1>登录</h1>
                </el-form-item>
                <el-form-item prop="username">
                    <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="registerData.username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码"
                        v-model="registerData.password"></el-input>
                </el-form-item>
                <el-form-item class="flex">
                    <div class="flex">
                        <el-checkbox v-model="rememberMe">记住我</el-checkbox>
                        <el-link type="primary" :underline="false">忘记密码？</el-link>
                    </div>
                </el-form-item>
                <!-- 登录按钮 -->
                <el-form-item>
                    <el-button class="button" type="primary" auto-insert-space @click="login">登录</el-button>
                </el-form-item>
                <el-form-item class="flex">
                    <el-link type="info" style="color: rgba(29, 114, 212, 0.5);" :underline="false" @click="isRegister = true; clearRegisterData()">
                        👉注册👈
                    </el-link>
                </el-form-item>
            </el-form>
        </el-col>
    </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
    height: 100vh;
    background-color: rgb(255, 255, 255)767;

    .bg {
        background: url('@/assets/Admin_images/logo.png') no-repeat 50% center / 400px auto,
            linear-gradient(rgba(255, 255, 255, 0.6), rgb(58, 175, 179)),
            /* 添加半透明黑色叠加 */
            url('@/assets/Admin_images/login_bg.png') no-repeat center / cover;

        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0px 50px rgba(18, 74, 138, 0.8);
    }

    .form {
        display: flex;
        flex-direction: column;
        justify-content: center;
        user-select: none;
        position: relative;

        .title {
            margin: 0 auto;
        }

        .button {
            width: 100%;
            //居中
            margin: 0 auto;
        }

        .flex {
            width: 100%;
            display: flex;
            justify-content: space-between;
        }
    }

    .translucent-form {
        background: rgba(255, 255, 255, 0.6);
        padding: 20px;
        border-radius: 15px;
        box-shadow: 0 50px 100px rgba(16, 36, 59, 0.3);
    }
    
}
</style>