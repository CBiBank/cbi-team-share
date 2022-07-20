import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // MF
    federation({
      // 远程模块声明
      remotes: {
        remote_app: "http://localhost:30001/assets/remoteEntry.js",
      },
      // 共享依赖
      shared: ["vue"],
    }),
  ],
  server:{
    port: 30000
  },
  build: {
    target: "esnext",
    minify: false,
  },
});
