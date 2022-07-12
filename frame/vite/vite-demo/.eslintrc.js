module.exports = {
  env: {
    browser: true,
    es2021: true
  },
  extends: [
    // 从 ESLint 本身继承；
    'eslint:recommended',
    // 从 ESLint 插件继承。
    'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    // 接入 prettier 的规则
    // 从类似 eslint-config-xxx 的 npm 包继承；
    'prettier',
    'plugin:prettier/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  //  加入 prettier 的 eslint 插件
  plugins: ['react', '@typescript-eslint', 'prettier'],
  rules: {
    // 注意要加上这一句，开启 prettier 自动修复的功能
    'prettier/prettier': 'error',
    quotes: ['error', 'single'],
    semi: ['error', 'always'],
    'react/react-in-jsx-scope': 'off'
  }
};
