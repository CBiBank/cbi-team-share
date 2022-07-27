module.exports = {
  env: {
    browser: true,
    es2021: true,
    'vue/setup-compiler-macros': true
  },
  extends: [
    // 从 ESLint 本身继承；
    'eslint:recommended',
    // 从 ESLint 插件继承。
    'plugin:vue/recommended',
    // 接入 prettier 的规则
    // 从类似 eslint-config-xxx 的 npm 包继承；
    'prettier',
    'plugin:prettier/recommended'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  plugins: ['vue', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'vue/no-multiple-template-root': 'off',
    'vue/multi-word-component-names': 'off',
    'no-mutating-props': 'off',
    'vue/no-v-html': 'off'
  }
}
