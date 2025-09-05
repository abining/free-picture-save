import { createApp } from "vue";
import { createPinia } from "pinia";
import '@/styles/index.less' // global css
import router from "./router/index.js";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/index.css";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import App from "./App.vue";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import loadingDirective from './directives/loading'
import dayjs from 'dayjs'
import { formatDate, fromNow, diff, isSameDay } from './utils/dayjs'

const app = createApp(App);

// 注册 v-loading 指令
app.directive('loading', loadingDirective)

// 注册全局方法
app.config.globalProperties.$dayjs = dayjs
app.config.globalProperties.$formatDate = formatDate
app.config.globalProperties.$fromNow = fromNow
app.config.globalProperties.$diff = diff
app.config.globalProperties.$isSameDay = isSameDay

app.use(ElementPlus, {
  locale: zhCn,
});
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.use(createPinia());
app.use(router);

app.mount("#app");

