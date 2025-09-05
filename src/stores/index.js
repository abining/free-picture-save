import { defineStore } from "pinia";
import { getProfile } from '@/api/user';
// import { asyncRoutes, constantRoutes,routes } from '@/router'

export const useMainStore = defineStore("main", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("user")) || null,
    theme: {
      // 菜单是否折叠
      isCollapse: false,
      // 主题色
      primaryColor: "#409EFF",
      // 菜单背景色
      menuBgColor: "#fff",
      // 菜单文字颜色
      menuTextColor: "#606266",
      // 菜单激活文字颜色
      menuActiveTextColor: "#409EFF",
      // 头部背景色
      headerBgColor: "#ffffff",
    },
    routes: [],
    addRoutes: [],
    // 城市选项数据（树形结构）
    cityOptions: [],
  }),
  actions: {
    async login(token) {
      this.user = { token };

      try {
        const userData = await getProfile();

        if (userData) {
          const userToStore = {
            ...userData,
            token: token,
          };
          this.setUser(userToStore);
          return userToStore;
        } else {
            throw new Error("验证失败，返回数据无效");
        }
      } catch (error) {
        this.clearUser();
        console.error("Login failed in store:", error);
        throw error;
      }
    },
    setUser(user) {
      localStorage.setItem("user", JSON.stringify(user));
      this.user = user;
    },
    clearUser() {
      localStorage.removeItem("user");
      this.user = null;
    },
    // 切换菜单折叠状态
    toggleCollapse() {
      this.theme.isCollapse = !this.theme.isCollapse;
    },
    // 更新主题配置
    updateTheme(theme) {
      this.theme = {
        ...this.theme,
        ...theme,
      };
    },
    // 设置城市选项数据
    setCityOptions(cityData) {
      this.cityOptions = cityData;
    },
  },
  getters: {
    checkAuth: (state) => {
      return state.user?true:false
    },
    // 让它执行一个函数，并且每次都会判断，确保刷新页面后，主题也会跟着刷新
    getUser: (state) => state.user,
    getTheme: (state) => state.theme,
    // 获取第一层城市选项（用于下拉选择）
    getFirstLevelCityOptions: (state) => {
      const options = [];
      state.cityOptions.forEach(province => {
        if (province.cityList && province.cityList.length > 0) {
          province.cityList.forEach(city => {
            options.push({
              label: city.cityName,
              value: city.cityId
            });
          });
        }
      });
      return options;
    },
    // 获取完整的城市树形数据
    getCityTreeData: (state) => state.cityOptions,
  },
});
// 动态加载组件
export const loadView = (view) => {
  return () => import(`@/${view}/index.vue`);
};
