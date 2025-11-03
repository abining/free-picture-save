<template>
  <div class="login-container">
    <div class="main-content">
      <div class="login-left">
        <!-- 五香土豆食谱内容 -->
        <div class="recipe-section">
          <h2 class="recipe-title">🥔 五香土豆的家常做法</h2>
          <div class="recipe-content">
            <div class="recipe-ingredients">
              <h3>所需食材：</h3>
              <ul>
                <li>土豆 500g</li>
                <li>五香粉 1茶匙</li>
                <li>盐 适量</li>
                <li>生抽 2汤匙</li>
                <li>老抽 1汤匙</li>
                <li>白糖 1茶匙</li>
                <li>蒜末 2瓣</li>
                <li>葱花 适量</li>
                <li>食用油 3汤匙</li>
              </ul>
            </div>
            
            <div class="recipe-steps">
              <h3>制作步骤：</h3>
              <ol>
                <li>土豆洗净去皮，切成滚刀块，用清水浸泡去除淀粉</li>
                <li>热锅下油，油温6成热时下土豆块，炸至表面金黄捞出</li>
                <li>锅中留底油，下蒜末爆香</li>
                <li>倒入炸好的土豆块，加入五香粉、盐、生抽、老抽、白糖</li>
                <li>大火翻炒均匀，让调料充分裹在土豆上</li>
                <li>最后撒上葱花，翻炒几下即可出锅</li>
              </ol>
            </div>

            <div class="recipe-tips">
              <h3>💡 小贴士：</h3>
              <p>土豆切好后一定要用清水浸泡，这样炸出来的土豆更酥脆。五香粉的用量可以根据个人口味调整，喜欢重口味的可以多放一些。</p>
            </div>
          </div>
        </div>

        <!-- 嵌入iframe区域 -->
        <div class="iframe-section">
          <h3>🍳 更多美食视频</h3>
          <iframe 
            src="https://space.bilibili.com/18202105" 
            frameborder="0" 
            allowfullscreen
            class="recipe-iframe"
          ></iframe>
        </div>
      </div>

      <div class="login-right">
        <!-- 右侧内容区域 -->
        <div class="right-content">
          <h2>📝 生活分享</h2>
          <p>在这里分享你的生活点滴，记录美好时光...</p>
          <div class="share-examples">
            <div class="example-item">
              <span class="emoji">🍳</span>
              <span>今天学会了做五香土豆，味道超棒！</span>
            </div>
            <div class="example-item">
              <span class="emoji">🌅</span>
              <span>清晨的阳光总是那么温暖</span>
            </div>
            <div class="example-item">
              <span class="emoji">📚</span>
              <span>读了一本好书，收获满满</span>
            </div>
          </div>
          
          <!-- 输入框区域 -->
          <div class="login-form-section">
            <el-form :model="form" :rules="rules" ref="loginFormRef" @submit.prevent>
              <el-form-item prop="token">
                <span class="svg-container">
                  <svg-icon icon-class="password" />
                </span>
                <el-input
                  v-model="form.token"
                  placeholder="请输入"
                  name="token"
                  @keyup.enter="handleLogin"
                />
              </el-form-item>
              <el-button type="primary" :loading="loading" @click="handleLogin" class="login-button">
                {{ loading ? "发布中..." : "发布" }}
              </el-button>
            </el-form>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 底部版权信息 -->
    <div class="footer-section">
      <div class="footer-content">
        <p class="copyright text-muted">
          Copyright &copy; pic管理平台 {{ currentYear }}
          <br>
          Powered by <a href="http://abining.fun" target="_blank">Ebin Blog</a> |
          <a href="https://beian.miit.gov.cn/" target="_blank">赣ICP备2024049236号</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useMainStore } from "@/stores";
import { ElMessage } from "element-plus";
const store = useMainStore();
const router = useRouter();
const route = useRoute();
const loginFormRef = ref(null);
const loading = ref(false);
const currentYear = new Date().getFullYear();

const form = reactive({
  token: "",
});

const rules = {
  token: [{ required: true, message: "请输入 API Token", trigger: "blur" }],
};

// 初始化token
const initToken = () => {
  // 1. 优先从URL query参数中获取token
  const urlToken = route.query.token;
  if (urlToken) {
    form.token = urlToken;
    return;
  }

  // 2. 从localStorage中获取token
  const storageToken = localStorage.getItem("token");
  if (storageToken) {
    try {
      const userData = storageToken;
      if (userData && userData) {
        form.token = userData;
        return;
      }
    } catch (error) {
      console.warn("解析localStorage中的用户数据失败:", error);
    }
  }
};

// 组件挂载时初始化token
onMounted(() => {
  initToken();
});

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validate();
    loading.value = true;
    
    // 调用store的login方法，该方法会自动将token存储到localStorage
    await store.login(form.token);
    localStorage.setItem("token", form.token);

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
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}


// 输入框聚焦动画
@keyframes inputFocus {
  0% {
    transform: translateY(0) scale(1);
  }
  50% {
    transform: translateY(-2px) scale(1.02);
  }
  100% {
    transform: translateY(-2px) scale(1);
  }
}


.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  padding: 15px 10px;
  gap: 15px;
}

.login-left {
  width: 65%;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  animation: slideInLeft 0.8s ease-out;
  
  // 食谱区域样式
  .recipe-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 25px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    }
    
    .recipe-title {
      font-size: 26px;
      margin-bottom: 20px;
      text-align: center;
      color: #fff;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
      animation: fadeInUp 0.6s ease-out 0.2s both;
    }
    
    .recipe-content {
      h3 {
        color: #ffd700;
        margin: 15px 0 12px 0;
        font-size: 18px;
        border-bottom: 2px solid rgba(255, 215, 0, 0.3);
        padding-bottom: 6px;
        animation: fadeInUp 0.6s ease-out 0.4s both;
      }
      
      ul, ol {
        padding-left: 20px;
        
        li {
          margin: 8px 0;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          animation: fadeInUp 0.6s ease-out calc(0.6s + var(--i) * 0.1s) both;
        }
      }
      
      .recipe-tips {
        background: rgba(255, 215, 0, 0.1);
        border-radius: 15px;
        padding: 18px;
        margin-top: 18px;
        border-left: 4px solid #ffd700;
        animation: fadeInUp 0.6s ease-out 0.8s both;
        
        p {
          color: rgba(255, 255, 255, 0.9);
          line-height: 1.6;
          margin: 0;
        }
      }
    }
  }
  
  // iframe区域样式
  .iframe-section {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    animation: fadeInUp 0.6s ease-out 1s both;
    
    h3 {
      color: #ffd700;
      margin-bottom: 18px;
      text-align: center;
      font-size: 20px;
    }
    
    .recipe-iframe {
      width: 100%;
      height: 280px;
      border-radius: 15px;
      border: none;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      transition: all 0.3s ease;
      
      &:hover {
        transform: scale(1.02);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

.login-right {
  width: 35%;
  padding: 20px;
  overflow-y: auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  animation: slideInRight 0.8s ease-out;
  
  .right-content {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 25px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    height: fit-content;
    animation: fadeInUp 0.6s ease-out 0.3s both;
    
    h2 {
      color: #667eea;
      margin-bottom: 18px;
      text-align: center;
      font-size: 22px;
      animation: fadeInUp 0.6s ease-out 0.5s both;
    }
    
    p {
      color: #666;
      text-align: center;
      margin-bottom: 20px;
      line-height: 1.6;
      animation: fadeInUp 0.6s ease-out 0.7s both;
    }
    
    .share-examples {
      .example-item {
        display: flex;
        align-items: center;
        padding: 12px;
        margin: 8px 0;
        background: rgba(102, 126, 234, 0.1);
        border-radius: 15px;
        border-left: 4px solid #667eea;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        cursor: pointer;
        animation: fadeInUp 0.6s ease-out calc(0.9s + var(--i) * 0.1s) both;
        
        &:hover {
          transform: translateX(8px) scale(1.02);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.25);
          background: rgba(102, 126, 234, 0.15);
        }
        
        &:active {
          transform: translateX(4px) scale(0.98);
        }
        
        .emoji {
          font-size: 18px;
          margin-right: 12px;
          transition: all 0.3s ease;
        }
        
        &:hover .emoji {
          transform: scale(1.2) rotate(5deg);
        }
        
        span:last-child {
          color: #333;
          font-size: 14px;
          font-weight: 500;
        }
      }
    }
    
    // 输入框区域样式
    .login-form-section {
      margin-top: 25px;
      padding-top: 25px;
      border-top: 2px solid rgba(102, 126, 234, 0.2);
      animation: fadeInUp 0.6s ease-out 1.1s both;
      
      .svg-container {
        padding: 6px 5px 6px 15px;
        color: #409EFF;
        vertical-align: middle;
        width: 30px;
        display: inline-block;
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.1);
          color: #667eea;
        }
      }

      // 输入框动效
      :deep(.el-input__wrapper) {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid #e4e7ed;
        border-radius: 12px;
        
        &:hover {
          border-color: #667eea;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
        }
        
        &.is-focus {
          border-color: #667eea;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.25);
          animation: inputFocus 0.3s ease-out;
        }
      }

      .login-button {
        width: 100%;
        margin-top: 15px;
        border-radius: 25px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        height: 45px;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
        
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s;
        }
        
        &:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 12px 30px rgba(102, 126, 234, 0.4);
          
          &::before {
            left: 100%;
          }
        }
        
        &:active {
          transform: translateY(-1px) scale(0.98);
        }
      }
      
      :deep(.el-form-item) {
        margin-bottom: 0;
      }
    }
  }
}

// 底部版权信息样式
.footer-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding: 15px 20px;
  box-shadow: 0 -2px 20px rgba(0, 0, 0, 0.1);
  animation: slideInUp 0.8s ease-out 1.2s both;
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    text-align: center;
    
    .copyright {
      margin: 0;
      color: #666;
      font-size: 14px;
      line-height: 1.6;
      
      a {
        color: #667eea;
        text-decoration: none;
        transition: all 0.3s ease;
        
        &:hover {
          color: #764ba2;
          text-decoration: underline;
          transform: translateY(-1px);
        }
      }
    }
  }
}

// 动画关键帧
@keyframes slideInLeft {
  0% {
    opacity: 0;
    transform: translateX(-50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  0% {
    opacity: 0;
    transform: translateX(50px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInUp {
  0% {
    opacity: 0;
    transform: translateY(50px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

// 响应式设计
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 0 5px;
    gap: 10px;
  }
  
  .login-left, .login-right {
    width: 100%;
    padding: 15px;
  }
  
  .recipe-section, .iframe-section {
    padding: 20px;
  }
  
  .recipe-title {
    font-size: 22px !important;
  }
  
  .footer-section {
    padding: 10px 15px;
    
    .footer-content {
      .copyright {
        font-size: 12px;
      }
    }
  }
}
</style>
