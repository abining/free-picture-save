<template>
    <el-drawer
      v-model="visible"
      title="主题设置"
      direction="rtl"
      size="300px"
    >
      <el-form label-width="100px">
        <el-form-item label="主题色">
          <el-color-picker 
            v-model="themeConfig.primaryColor"
            @change="handleThemeChange" 
          />
        </el-form-item>
  
        <el-form-item label="菜单背景色">
          <el-color-picker 
            v-model="themeConfig.menuBgColor"
            @change="handleThemeChange"
          />
        </el-form-item>
  
        <el-form-item label="菜单文字颜色">
          <el-color-picker 
            v-model="themeConfig.menuTextColor"
            @change="handleThemeChange"
          />
        </el-form-item>
  
        <el-form-item label="菜单激活色">
          <el-color-picker 
            v-model="themeConfig.menuActiveTextColor"
            @change="handleThemeChange"
          />
        </el-form-item>
  
        <el-form-item label="顶栏背景色">
          <el-color-picker 
            v-model="themeConfig.headerBgColor"
            @change="handleThemeChange"
          />
        </el-form-item>
  
        <el-form-item>
          <el-button type="primary" @click="handleSave">保存配置</el-button>
          <el-button @click="handleReset">恢复默认</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useMainStore } from '@/stores'
  
  const store = useMainStore()
  const visible = ref(false)
  
  // 克隆主题配置
  const themeConfig = reactive({...store.theme})
  
  // 处理主题变化
  const handleThemeChange = () => {
    store.updateTheme(themeConfig)
  }
  
  // 保存配置
  const handleSave = () => {
    store.updateTheme(themeConfig)
    // 这里可以添加持久化存储逻辑
    visible.value = false
  }
  
  // 重置配置
  const handleReset = () => {
    Object.assign(themeConfig, {
      primaryColor: '#409EFF',
      menuBgColor: '#304156',
      menuTextColor: '#bfcbd9',
      menuActiveTextColor: '#409EFF',
      headerBgColor: '#ffffff',
    })
    store.updateTheme(themeConfig)
  }
  
  // 对外暴露打开方法
  defineExpose({
    open: () => visible.value = true
  })
  </script>
  
  <style scoped lang="less">
  .el-form {
    padding: 20px;
  }
  </style>