<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="store.theme.isCollapse ? '64px' : '200px'" class="aside" style="padding: 0px;">
      <div class="logo">
        <span v-show="!store.theme.isCollapse">pic管理平台</span>
      </div>
      <el-menu :default-active="route.path" class="el-menu-vertical" :collapse="store.theme.isCollapse"
        :background-color="store.theme.menuBgColor" :text-color="store.theme.menuTextColor"
        :active-text-color="store.theme.menuActiveTextColor" router>
        <template v-for="item in menuList" :key="item.path">
          <el-menu-item v-if="!item.children && !item.meta?.isHide" :index="item.fullPath">
            <el-icon>
              <component :is="item.meta?.icon || 'Document'" />
            </el-icon>
            <template #title>{{ item.meta?.title }}</template>
          </el-menu-item>

          <el-sub-menu v-else="item.children && !item.meta?.isHide" :index="item.fullPath">
            <template #title>
              <el-icon>
                <component :is="item.meta?.icon || 'Document'" />
              </el-icon>
              <span>{{ item.meta?.title }}</span>
            </template>
            <el-menu-item v-for="child in item.children" :key="child.path" :index="child.fullPath"
              v-show="!child.meta?.isHide">
              <el-icon>
                <component :is="child.meta?.icon || 'Document'" />
              </el-icon>
              <template #title>{{ child.meta?.title }}</template>
            </el-menu-item>
          </el-sub-menu>
        </template>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header" :style="{ backgroundColor: store.theme.headerBgColor }">
        <div class="header-left">
          <el-icon class="fold-icon" @click="handleCollapse">
            <Fold v-if="!store.theme.isCollapse" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>首页</el-breadcrumb-item>
            <el-breadcrumb-item>{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <!-- 主题配置 -->
          <!-- <el-button size="small" @click="openThemeSetting">
            <el-icon><Brush /></el-icon>
            主题设置
          </el-button> -->

          <el-dropdown class="user-dropdown">
            <span class="user-info">
              {{ store.user?.username }}
              <el-icon>
                <CaretBottom />
              </el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主要内容区域 -->
      <el-main class="main">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
  <SettingTheme ref="themeDrawer" />
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMainStore } from "@/stores";
import SettingTheme from "./setting-theme.vue";

const route = useRoute();
const router = useRouter();
const store = useMainStore();

function joinPath(parent, child) {
  if (!parent) return child.startsWith('/') ? child : '/' + child
  if (child.startsWith('/')) return child
  return parent.endsWith('/') ? parent + child : parent + '/' + child
}
function mapMenu(routes, parentPath = '') {
  return routes
    .filter(route => !route.meta?.isHide)
    .map(route => {
      const fullPath = joinPath(parentPath, route.path)
      const item = {
        ...route,
        fullPath,
      }
      if (route.children && route.children.length) {
        item.children = mapMenu(route.children, fullPath)
      }
      return item
    })
}

// 获取路由配置生成菜单
const menuList = computed(() => {
  const root = router.options.routes.find(route => route.path === '/')
  return root ? mapMenu(root.children) : []

});

// 处理菜单折叠
const handleCollapse = () => {
  store.toggleCollapse();
};

const handleLogout = () => {
  store.clearUser()
  router.push("/login");
};

// 主题设置抽屉引用
const themeDrawer = ref(null);

// 打开主题设置
const openThemeSetting = () => {
  themeDrawer.value.open();
};
</script>

<style scoped lang="less">
.layout-container {
  height: 100vh;

  .aside {
    background-color: v-bind("store.theme.menuBgColor");
    transition: width 0.3s;

    .logo {
      height: 60px;
      display: flex;
      align-items: center;
      padding: 0 20px;
      // color: #fff;
      overflow: hidden;

      img {
        width: 32px;
        height: 32px;
        margin-right: 12px;
      }

      span {
        font-size: 16px;
        font-weight: 600;
        white-space: nowrap;
      }
    }

    .el-menu {
      border-right: none;
    }

    // 设置菜单项悬停背景色
    :deep(.el-menu-item:hover) {
      background-color: #e6f7ff !important;
    }

    :deep(.el-sub-menu .el-menu-item:hover) {
      background-color: #e6f7ff !important;
    }

    :deep(.el-sub-menu:hover) {
      background-color: #e6f7ff !important;
    }

    :deep(.el-sub-menu__title:hover) {
      background-color: #e6f7ff !important;
    }
  }

  .header {
    border-bottom: 1px solid #e6e6e6;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;

    .header-left {
      display: flex;
      align-items: center;

      .fold-icon {
        font-size: 20px;
        margin-right: 20px;
        cursor: pointer;
      }
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 20px;

      .theme-dropdown {
        margin-right: 10px;
      }

      .user-info {
        display: flex;
        align-items: center;
        cursor: pointer;

        .el-icon {
          margin-left: 4px;
        }
      }
    }
  }

  .main {
    background-color: #f0f2f5;
    // padding: 20px;
    padding: 0px;
    overflow: scroll;
    scrollbar-width: none;
  }
}
</style>
