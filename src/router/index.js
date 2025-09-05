// import { createRouter, createWebHistory } from 'vue-router'
import {
  createRouter,
  createWebHistory,
  createWebHashHistory,
} from "vue-router";
import Layout from "@/views/layout/index.vue";
import EmptyByCatalog from "@/views/layout/emptyByCatalog.vue";

import { useMainStore } from "@/stores";

const routes = [
  {
    path: "/",
    name: "root",
    component: Layout,
    redirect: "/profile",
    children: [
      {
        path: "profile",
        name: "Profile",
        component: () => import("@/views/profile/index.vue"),
        meta: { icon: "User", title: "个人中心" },
      },
      {
        path: "images",
        redirect: "/images/list",
        name: "Images",
        component: EmptyByCatalog, // 使用空组件作为二级路由容器
        meta: { title: "图片管理", icon: "Picture" },
        children: [
          {
            path: "list",
            name: "ImageList",
            component: () => import("@/views/images/list/index.vue"),
            meta: { title: "图片列表" },
          },
          {
            path: "upload",
            name: "ImageUpload",
            component: () => import("@/views/images/upload/index.vue"),
            meta: { title: "上传图片" },
          },
        ],
      },
      {
        path: "albums",
        name: "AlbumList",
        component: () => import('@/views/albums/index.vue'),
        meta: { title: '相册管理', icon: 'Collection' }
      },
      {
        path: "strategies",
        name: "StrategyList",
        component: () => import('@/views/strategies/index.vue'),
        meta: { title: '存储策略', icon: 'Coin' }
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
    },
  },
  // 404页面
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/404/index.vue"),
    meta: {
      title: "404",
    },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// 修改路由拦截器，在内部获取 store
router.beforeEach((to, from, next) => {
  const store = useMainStore();
  // 如果是登录页面,直接放行
  if (to.path === "/login") {
    next();
    return;
  }
  // 判断是否登录
  if (store.checkAuth) {
    next();
  } else {
    // 1. 记录原始目标路径
    next({
      path: "/login",
      query: { redirect: to.fullPath }, // 关键：将目标路径存入URL参数
    });
  }
});

export default router;
