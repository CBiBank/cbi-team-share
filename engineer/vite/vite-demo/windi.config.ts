import { defineConfig } from 'vite-plugin-windicss';

export default defineConfig({
  // 开启 attributify 属性化
  attributify: true,
  shortcuts: {
    'flex-c': 'flex justify-center items-center',
    'flex-around': 'flex justify-around'
  }
});
