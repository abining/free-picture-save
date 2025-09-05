<template>
  <div class="login-container">
    <div class="login-left"></div>
    <div class="login-right">
      <div class="login-form">
        <div class="title-container">
          <h1>管理平台</h1>
        </div>
        <el-form :model="form" :rules="rules" ref="loginFormRef" @submit.prevent>
          <el-form-item prop="token">
            <span class="svg-container">
              <svg-icon icon-class="password" />
            </span>
            <el-input
              v-model="form.token"
              placeholder="请输入您的 API Token"
              name="token"
              @keyup.enter="handleLogin"
            />
          </el-form-item>
          <el-button type="primary" :loading="loading" @click="handleLogin" class="login-button">
            {{ loading ? "验证中..." : "登录" }}
          </el-button>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useMainStore } from "@/stores";
import { ElMessage } from "element-plus";

const store = useMainStore();
const router = useRouter();
const route = useRoute();
const loginFormRef = ref(null);
const loading = ref(false);

const form = reactive({
  token: "",
});

const rules = {
  token: [{ required: true, message: "请输入 API Token", trigger: "blur" }],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validate();
    loading.value = true;
    await store.login(form.token);

    ElMessage.success("登录成功");
    const redirectPath = route.query.redirect || "/";
    router.replace(redirectPath);
  } catch (error) {
    ElMessage.error(error.message || "Token 验证失败，请检查您的 Token 是否正确。");
    console.error("登录失败:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="less" scoped>
.login-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  overflow: hidden;
}

.login-left {
  width: 60%;
  height: 100%;
  background: #f0f2f5 url('@/assets/svg/react-native-firebase-1.svg') no-repeat center center / contain;
}

.login-right {
  width: 40%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #fff;
}

.login-form {
  width: 450px;
  max-width: 90%;
  padding: 40px;
  border-radius: 8px;
  
  .title-container {
    text-align: center;
    margin-bottom: 30px;

    h1 {
      font-size: 24px;
      color: #303133;
    }
  }

  .svg-container {
    padding: 6px 5px 6px 15px;
    color: #409EFF;
    vertical-align: middle;
    width: 30px;
    display: inline-block;
  }

  .login-button {
    width: 100%;
    margin-top: 10px;
  }
}
</style>
