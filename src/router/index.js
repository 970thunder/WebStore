import { createRouter, createWebHistory } from "vue-router";

import LoginVue from '@/views/Admin/Login.vue'
import LayoutVue from '@/views/Admin/Layout.vue'

import BackHomeVue from '@/views/Admin/good/BackHome.vue'
import GoodCategoryVue from '@/views/Admin/good/GoodsCategory.vue'
import GoodManageVue from '@/views/Admin/good/GoodsManage.vue'

import UserAvatarVue from '@/views/Admin/user/UserAvatar.vue'
import UserInfoVue from '@/views/Admin/user/UserInfo.vue'
import UserResetPasswordVue from '@/views/Admin/user/UserResetPassword.vue'

import QAchat from "@/views/Front/chatmodel/QAchat.vue"

const routes = [
    {
        path: '/Admin/login',
        component: LoginVue,
    },
    {
        path: '/',
        redirect: '/Admin/login',
    },
    {
        path: '/Admin/good',
        component: LayoutVue, redirect: '/Admin/good/backHome', children: [
            {
                path: '/Admin/good/backHome',
                component: BackHomeVue,
            },
            {
                path: '/Admin/good/category',
                component: GoodCategoryVue,
            },
            {
                path: '/Admin/good/manage',
                component: GoodManageVue,
            },
            {
                path: '/Admin/user/avatar',
                component: UserAvatarVue,
            },
            {
                path: '/Admin/user/info',
                component: UserInfoVue,
            },
            {
                path: '/Admin/user/resetPassword',
                component: UserResetPasswordVue,
            },
            {
                path: '/chat',
                component: QAchat,
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})
export default router;