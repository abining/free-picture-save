import { defineConfig, loadEnv } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import path from "path";

import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProd = mode === "production";
  const isTest = mode === "test";
  const env = loadEnv(mode, process.cwd());
  
  
  return {
    base: './',
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    plugins: [
      vue(),
      AutoImport({ resolvers: [ElementPlusResolver()] }),
      Components({ resolvers: [ElementPlusResolver()] }),
    ],
    server: {
      host: "0.0.0.0",
      port: 5174,
      proxy: {
        // "/api": {
        //   target: env.VITE_APP_FILE_API,
        //   rewrite: (path) => path.replace(/^\/api/, ""),
        //   changeOrigin: true
        // },
        "/api": {
          target: env.VITE_APP_PROXY_API,
          rewrite: (path) => path.replace(/^\/api/, ""),
          changeOrigin: true
        },
      },
    },
    build: {
      outDir: isProd ? "dist" : "dist",
      assetsDir: "assets",
      rollupOptions: {
        output: {
          // 确保生成的静态资源路径正确
          assetFileNames: `assets/[name]-[hash][extname]`,
          chunkFileNames: `assets/[name]-[hash].js`,
          entryFileNames: `assets/[name]-[hash].js`,
        },
      },
    },
  };
});
