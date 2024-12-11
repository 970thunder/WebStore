<script setup>
import '@/assets/el.css';

import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { userPasswordUpdateService } from '@/api/user.js';
import { useUserInfoStore } from '@/stores/userInfo.js';
import { ElMessage, ElMessageBox } from 'element-plus'

const userInfoStore = useUserInfoStore()
const userPassword = ref({ ...userInfoStore.info })

const router = useRouter();

const passwordRules = {
    old_pwd: [
        { required: true, message: '请输入旧密码', trigger: 'blur' },
        {
            pattern: /^\S{5,16}$/,
            message: '密码必须是5-16位的非空字符串',
            trigger: 'blur',
        },
    ],
    new_pwd: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        {
            pattern: /^\S{5,16}$/,
            message: '密码必须是5-16位的非空字符串',
            trigger: 'blur',
        },
    ],
    re_pwd: [
        { required: true, message: '请确认新密码', trigger: 'blur' },
        {
            pattern: /^\S{5,16}$/,
            message: '密码必须是5-16位的非空字符串',
            trigger: 'blur',
        },
        {
            validator: (rule, value, callback) => {
                if (value !== userPassword.value.new_pwd) {
                    callback(new Error('两次输入的密码不一致'));
                } else {
                    callback();
                }
            },
            trigger: 'blur',
        },
    ],
};

const updatePassword = async () => {
    let result = await userPasswordUpdateService(userPassword.value);
    ElMessage.success(result.msg ? result.msg : '密码修改成功');
    userInfoStore.setInfo(userPassword.value);
    router.push('/Admin/login')
}

</script>

<template>
    <el-card class="page-container">
        <template #header>
            <div class="header">
                <span>修改密码</span>
            </div>
        </template>
        <el-row>
            <el-col :span="12">
                <el-form :model="userPassword" :rules="passwordRules" label-width="100px" size="large">
                    <el-form-item label="旧密码" prop="old_pwd">
                        <el-input v-model="userPassword.old_pwd" type="password" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="新密码" prop="new_pwd">
                        <el-input v-model="userPassword.new_pwd" type="password" show-password></el-input>
                    </el-form-item>
                    <el-form-item label="确认新密码" prop="re_pwd">
                        <el-input v-model="userPassword.re_pwd" type="password" show-password></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="updatePassword">修改密码</el-button>
                    </el-form-item>
                </el-form>
            </el-col>
        </el-row>
    </el-card>
</template>

<style scoped> 

</style>