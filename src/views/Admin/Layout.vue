<script setup>
import '@/assets/el.css';

import {
    Management,
    Promotion,
    UserFilled,
    User,
    Crop,
    EditPen,
    SwitchButton,
    CaretBottom
} from '@element-plus/icons-vue'
import avatar from '@/assets/Admin_images/default.png'

//导入接口函数
import { userInfoGetService } from '@/api/user.js'
//导入pinia
import { useUserInfoStore } from '@/stores/userInfo.js'
import { useTokenStore } from '@/stores/token.js'
const tokenStore = useTokenStore();
const userInfoStore = useUserInfoStore();
import { ref } from 'vue'

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

//顶部点击事件
import { useRouter } from 'vue-router'
const router = useRouter()
import { ElMessage, ElMessageBox } from 'element-plus'

const handleCommand = (command) => {
    if (command === 'logout') {
        //退出登录
        ElMessageBox.confirm(
            '你确认要退出吗？',
            '温馨提示',
            {
                confirmButtonText: '确认',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
            .then(async () => {
                //用户退出
                //清空pinia
                tokenStore.removeToken()
                userInfoStore.removeInfo()
                //跳转登录页面
                router.push('/Admin/login')

                ElMessage({
                    type: 'success',
                    message: '账号已退出',
                })
            })
            .catch(() => {
                //用户点击了取消
                ElMessage({
                    type: 'info',
                    message: '用户取消退出登录操作',
                })
            })
    } else {
        //路由
        router.push('/Admin/user/' + command)
    }
}

</script>

<template>
    <!-- element-plus里的一个容器 -->
    <el-container class="layout-container">
        <!-- 左侧菜单 -->
        <el-aside width="200px">
            <div class="el-aside__logo"></div>
            <!-- 菜单样式 -->
            <el-menu active-text-color="#37c0ca" background-color="#8beada" text-color="#000000" router>
                <el-menu-item index="/chat">
                    <el-icon>
                        <Promotion />
                    </el-icon>
                    <span>旅行问答</span>
                </el-menu-item>
                <el-menu-item index="/Admin/good/category">
                    <el-icon>
                        <Management />
                    </el-icon>
                    <span>始于足下</span>
                </el-menu-item>
                <el-menu-item index="/Admin/good/manage">
                    <el-icon>
                        <Promotion />
                    </el-icon>
                    <span>纪念品生成</span>
                </el-menu-item>
                <el-sub-menu index="3">
                    <template #title>
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                        <span>个人中心</span>
                    </template>
                    <el-menu-item index="/Admin/user/info">
                        <el-icon>
                            <User />
                        </el-icon>
                        <span>基本资料</span>
                    </el-menu-item>
                    <el-menu-item index="/Admin/user/avatar">
                        <el-icon>
                            <Crop />
                        </el-icon>
                        <span>更换头像</span>
                    </el-menu-item>
                    <el-menu-item index="/Admin/user/resetPassword">
                        <el-icon>
                            <EditPen />
                        </el-icon>
                        <span>重置密码</span>
                    </el-menu-item>
                </el-sub-menu>

            </el-menu>
        </el-aside>
        <!-- 右侧主区域 -->
        <el-container>
            <!-- 头部区域 -->
            <el-header>
                <!-- 昵称不为空时则优先显示，否则显示用户名 -->
                <div>
                    欢迎名为👉<strong>{{ userInfoStore.info.nickname ? userInfoStore.info.nickname :
                        userInfoStore.info.username
                        }}</strong>
                    👈的大老板</div>
                <el-dropdown placement="bottom-end" @command="handleCommand">
                    <span class="el-dropdown__box">
                        <el-avatar :src="userInfoStore.info.userPic ? userInfoStore.info.userPic : avatar" />
                        <el-icon>
                            <CaretBottom />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="info" :icon="User">基本资料</el-dropdown-item>
                            <el-dropdown-item command="avatar" :icon="Crop">更换头像</el-dropdown-item>
                            <el-dropdown-item command="resetPassword" :icon="EditPen">重置密码</el-dropdown-item>
                            <el-dropdown-item command="logout" :icon="SwitchButton">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </el-header>
            <!-- 中间区域 -->
            <el-main>
                <!-- <div style="width: 1290px; height: 570px;border: 1px solid red;">
                    内容展示区
                </div> -->
                <RouterView></RouterView>
            </el-main>
            <!-- 底部区域 -->
            <el-footer>
                <a href="http://beian.miit.gov.cn/" target="_blank" class="beian">Hyper见闻 ©2024 桂ICP备2024034221号</a>
            </el-footer>
        </el-container>
    </el-container>
</template>

<style lang="scss" scoped>

.layout-container {
    height: 100vh;

    .el-aside {

        background-image: linear-gradient(to bottom, #b1f6d8, #8beada, #63dce0, #39cde6, #12bceb);

        &__logo {
            height: 120px;
            background: url('@/assets/Admin_images/logo.png') no-repeat center / 100px auto;
        }

        .el-menu {
            background-image: linear-gradient(to bottom,  #8beada, #63dce0,);
            color: #000000;
            /* 黑色文字 */

            .el-menu-item {
                &:hover {
                    background-color: #37c0ca; // 鼠标悬停背景
                    color: #ffffffef; // 悬停文字颜色
                }

                &.is-active {
                    background-color: #46b9b9; // 选中菜单背景
                    color: #ffffff; // 选中菜单文字颜色
                }
            }
        }
    }

    .el-header {
        background-color: rgba(166, 233, 213, 0.5);
        // 阴影效果
        box-shadow: 0px 5px 0px rgba(75, 75, 75, 0.1);
        background-image: linear-gradient(to right, #b1f6d8, #8beada, #63dce0, #39cde6, #12bceb);        display: flex;
        align-items: center;
        justify-content: space-between;

        .el-dropdown__box {
            display: flex;
            align-items: center;

            .el-icon {
                color: #83f9be;
                margin-left: 10px;
            }

            &:active,
            &:focus {
                outline: none;
            }
        }
    }

    .el-footer {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0px;
        height: 40px;
        font-size: 14px;
        // 磨砂半透明
        background-color: rgba(255, 255, 255, 0.1);
    }
}

.beian {
    //去除下划线
    text-decoration: none;
    //更改字体颜色
    color: #666;
}
</style>