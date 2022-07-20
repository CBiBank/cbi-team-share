
# ESLint

项目内安装依赖

```bash
pnpm i eslint -D
```

接着执行 ESLint 的初始化命令，并进行如下的命令行交互:

```bash
npx eslint --init
```

ESLint 会帮我们自动生成.eslintrc.js 配置文件。需要注意的是，在上述初始化流程中我们并没有安装依赖，需要进行手动安装:

```
pnpm i eslint-plugin-react@latest @typescript-eslint/eslint-plugin@latest @typescript-eslint/parser@latest -D
```

## 配置解读

1.  parser - 解析器

    ESLint 底层默认使用 Espree 来进行 AST 解析，这个解析器目前已经基于 Acron 来实现，虽然说 Acron 目前能够解析绝大多数的 ECMAScript 规范的语法，但还是不支持 TypeScript ，因此需要引入其他的解析器完成 TS 的解析。

2.  parserOptions - 解析器选项

    ecmaVersion: 这个配置和 Acron 的 ecmaVersion 是兼容的，可以配置 ES + 数字(如 ES6)或者 ES + 年份(如 ES2015)，也可以直接配置为 latest，启用最新的 ES 语法。
    sourceType: 默认为 script，如果使用 ES Module 则应设置为 module
    ecmaFeatures: 为一个对象，表示想使用的额外语言特性，如开启 jsx。

3.  rules - 具体代码规则
4.  plugins

    ESLint 不能直接解析 js，所以，指定 parser 选项为@typescript-eslint/parser 才能兼容 TS 的解析

5.  extends - 继承配置

    ```ts
    module.exports = {
      "extends": [
        // 第1种情况
        "eslint:recommended",
        // 第2种情况，一般配置的时候可以省略 `eslint-config`
        "standard"
        // 第3种情况，可以省略包名中的 `eslint-plugin`
        // 格式一般为: `plugin:${pluginName}/${configName}`
        "plugin:react/recommended"
        "plugin:@typescript-eslint/recommended",
      ]
    }
    ```

6.  env 和 globals

    运行变量和全局变量

    ```ts
    module.export = {
      env: {
        browser: "true",
        node: "true",
      },
    };
    ```

# 加入 Prettier

ESLint 的主要优势在于代码的风格检查并给出提示,而在代码格式化这一块 Prettier 做的更加专业

```ts
pnpm i prettier -D


// .prettierrc.js
module.exports = {
  printWidth: 80, //一行的字符数，如果超过会进行换行，默认为80
  tabWidth: 2, // 一个 tab 代表几个空格数，默认为 2 个
  useTabs: false, //是否使用 tab 进行缩进，默认为false，表示用空格进行缩减
  singleQuote: true, // 字符串是否使用单引号，默认为 false，使用双引号
  semi: true, // 行尾是否使用分号，默认为true
  trailingComma: "none", // 是否使用尾逗号
  bracketSpacing: true // 对象大括号直接是否有空格，默认为 true，效果：{ a: 1 }
};
```

安装工具包

```bash
pnpm i eslint-config-prettier eslint-plugin-prettier -D
```

定义好，接下来，定义脚本

```json
{
  "scripts": {
    "lint:script": "eslint --ext .js,.jsx,.ts,.tsx --fix --quiet ./"
  }
}
```

```bash
pnpm run lint:script
```

可以在 VSCode 中安装 ESLint 和 Prettier 这两个插件，并且在设置区中开启 Format On Save

保存后自动就修复了

在 Vite 中接入 ESLint

```bash
pnpm i vite-plugin-eslint -D
```

```ts
import viteEslint from "vite-plugin-eslint";

export default defineConfig({
  // 具体配置
  plugins: [
    // 省略其它插件
    viteEslint(),
  ];
})
```

# 加入样式规范 Stylelint

Stylelint 主要专注于样式代码的规范检查，内置了 170 多个 CSS 书写规则，支持 CSS 预处理器(如 Sass、Less)，提供插件化机制以供开发者扩展规则，已经被 Google、Github 等大型团队投入使用

为什么用它？因为够专业

```bash
pnpm i stylelint stylelint-prettier stylelint-config-prettier stylelint-config-recess-order stylelint-config-standard stylelint-config-standard-scss -D
```

添加.stylelintrc.js

```ts
module.exports = {
  // 注册 stylelint 的 prettier 插件
  plugins: ["stylelint-prettier"],
  // 继承一系列规则集合
  extends: [
    // standard 规则集合
    "stylelint-config-standard",
    // standard 规则集合的 scss 版本
    "stylelint-config-standard-scss",
    // 样式属性顺序规则
    "stylelint-config-recess-order",
    // 接入 Prettier 规则
    "stylelint-config-prettier",
    "stylelint-prettier/recommended",
  ],
  // 配置 rules
  rules: {
    // 开启 Prettier 自动格式化功能
    "prettier/prettier": true,
  },
};
```

添加脚本

```json
{
  "scripts": {
    // 整合 lint 命令
    "lint": "npm run lint:script && npm run lint:style",
    // stylelint 命令
    "lint:style": "stylelint --fix \"src/**/*.{css,scss}\""
  }
}
```

在 Vite 中集成 Stylelint

```bash
pnpm i @amatlash/vite-plugin-stylelint -D
```

```ts
import viteStylelint from '@amatlash/vite-plugin-stylelint';

export default defineConfig({
  // 具体配置
  {
    plugins: [
      // 省略其它插件
      viteStylelint({
        // 对某些文件排除检查
        exclude: /windicss|node_modules/
      }),
    ]
  }
})

```

# Husky + lint-staged 的 Git 提交工作流集成

Husky + lint-staged 可以再代码提交的时候进行卡点检查，也就是拦截 git commit 命令，进行代码格式检查，只有确保通过格式检查才允许正常提交代码

区中已经有了对应的工具——Husky

```bash
pnpm i husky -D
```

一般来说，在 package.json 配置 husky 的钩子

```json
{
  "husky": {
    "pre-commit": "npm run lint"
  }
}
```

但是，这种做法在 Husky 4.x 及以下版本没问题，而在最新版本(7.x 版本)中是无效的

在新版中，需要以下步骤

1.  初始化：npx husky install，并将 husky install 作为项目启动前脚本

```json
{
  "scripts": {
    // 会在安装 npm 依赖后自动执行
    "postinstall": "husky install"
  }
}
```

2.  添加 Husky 钩子，在终端执行如下命令:

```bash
npx husky add .husky/pre-commit "npm run lint"
```

将在项目根目录的.husky 目录中看到名为 pre-commit 的文件，里面包含了 git commit 前要执行的脚本。现在，当执行 git commit 的时候，会首先执行 npm run lint 脚本，通过 Lint 检查后才会正式提交代码记录

不过，刚才我们直接在 Husky 的钩子中执行 npm run lint，这会产生一个额外的问题: Husky 中每次执行 npm run lint 都对仓库中的代码进行全量检查，也就是说，即使某些文件并没有改动，也会走一次 Lint 检查，当项目代码越来越多的时候，提交的过程会越来越慢，影响开发体验。

而 lint-staged 就是用来解决上述全量扫描问题的，可以实现只对存入暂存区的文件进行 Lint 检查，大大提高了提交代码的效率。

```bash
pnpm i -D lint-staged
```

然后在 package.json 中添加如下的配置:

```json
{
  "lint-staged": {
    "**/*.{js,jsx,tsx,ts,json}": ["npm run lint:script", "git add --force"],
    "**/*.{scss}": ["npm run lint:style", "git add --force"]
  }
}
```

接下来我们需要在 Husky 中应用 lint-stage，回到.husky/pre-commit 脚本中，将原来的 npm run lint 换成如下脚本:

```bash
npx --no -- lint-staged
```

# 提交时的 commit 规范问题

安装工具库

```bash
pnpm i commitlint @commitlint/cli @commitlint/config-conventional -D
```

新建.commitlintrc.js

```ts
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
```

一般我们直接使用@commitlint/config-conventional 规范集就可以了，它所规定的 commit 信息一般由两个部分: type 和 subject 组成，结构如下:

```js
// type 指提交的类型
// subject 指提交的摘要信息
<type>: <subject>
```

常用的 type 值包括如下:

- feat: 添加新功能。
- fix: 修复 Bug。
- chore: 一些不影响功能的更改。
- docs: 专指文档的修改。
- perf: 性能方面的优化。
- refactor: 代码重构。
- test: 添加一些测试代码等等。
  接下来我们将 commitlint 的功能集成到 Husky 的钩子当中，在终端执行如下命令即可:

```bash
npx husky add .husky/commit-msg "npx --no-install commitlint -e $HUSKY_GIT_PARAMS"
```

可以发现在.husky 目录下多出了 commit-msg 脚本文件，表示 commitlint 命令已经成功接入到 husky 的钩子当中
