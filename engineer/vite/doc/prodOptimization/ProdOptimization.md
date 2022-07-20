# 自定义部署域名

```ts
// vite.config.ts
// 是否为生产环境，在生产环境一般会注入 NODE_ENV 这个环境变量，见下面的环境变量文件配置
const isProduction = process.env.NODE_ENV === "production";
// 填入项目的 CDN 域名地址
const CDN_URL = "xxxxxx";

// 具体配置
{
  base: isProduction ? CDN_URL : "/";
}

// .env.development
NODE_ENV = development;

// .env.production
NODE_ENV = production;
```

如果有不同的 cdn 怎么办，写死，不太优雅

可以写到.env 内

```ts
VITE_IMG_BASE_URL=https://my-image-cdn.com
```

zaivite-env.d.ts 增加类型声明:

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string;
  // 自定义的环境变量
  readonly VITE_IMG_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

某个环境变量要在 Vite 中通过 import.meta.env 访问，那么它必须以 VITE\_开头，如 VITE_IMG_BASE_URL，与 VueCli 类似

```tsx
<img src={new URL("./logo.png", import.meta.env.VITE_IMG_BASE_URL).href} />
```

# 小图片处理

```json
{
  build: {
    // 8 KB
    assetsInlineLimit: 8 * 1024
  }
}
```

> svg 格式的文件不受这个临时值的影响，始终会打包成单独的文件，因为它和普通格式的图片不一样，需要动态设置一些属性

# 图片压缩

前端的项目中经常基于它来进行图片压缩，比如 Webpack 中的 image-webpack-loader。社区当中也已经有了开箱即用的 Vite 插件——vite-plugin-imagemi

```bash
pnpm i vite-plugin-imagemin -D
```

配置文件：

```ts
//vite.config.ts
import viteImagemin from "vite-plugin-imagemin";

...
{
  plugins: [
    // 忽略前面的插件
    viteImagemin({
      // 无损压缩配置，无损压缩下图片质量不会变差
      optipng: {
        optimizationLevel: 7,
      },
      // 有损压缩配置，有损压缩下图片质量可能会变差
      pngquant: {
        quality: [0.8, 0.9],
      },
      // svg 优化
      svgo: {
        plugins: [
          {
            name: "removeViewBox",
          },
          {
            name: "removeEmptyAttrs",
            active: false,
          },
        ],
      },
    }),
  ];
}
```

打包尝试一下

# 雪碧图优化

Vite 中提供了 import.meta.glob 的语法糖来解决这种批量导入的问题，如上述的 import 语句可以写成下面这样

```ts
const icons = import.meta.glob("../../assets/icons/logo-*.svg");
```

可以看到对象的 value 都是动态 import，适合按需加载的场景。在这里我们只需要同步加载即可，可以使用 import.meta.globEager 来完成:

```ts
const icons = import.meta.globEager("../../assets/icons/logo-*.svg");
```

应用到组件中

```tsx
const iconUrls = Object.values(icons).map((mod) => mod.default);

// 组件返回内容添加如下
{
  iconUrls.map((item) => <img src={item} key={item} width="50" alt="" />);
}
```

可以看到，发送了 5 个 svg 请求

假设页面有 100 个 svg 图标，将会多出 100 个 HTTP 请求，依此类推。。。。。所以需要优化一下

合并图标的方案也叫雪碧图，我们可以通过 vite-plugin-svg-icons 来实现这个方案，首先安装一下这个插件

```bash
pnpm i vite-plugin-svg-icons -D
```

配置文件内增加

```ts
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";

{
  plugins: [
    // 省略其它插件
    createSvgIconsPlugin({
      iconDirs: [path.join(__dirname, "src/assets/icons")],
    }),
  ];
}
```

新建 SvgIcon 组件

```tsx
// SvgIcon/index.tsx
export interface SvgIconProps {
  name?: string;
  prefix: string;
  color: string;
  [key: string]: string;
}

export default function SvgIcon({
  name,
  prefix = "icon",
  color = "#333",
  ...props
}: SvgIconProps) {
  const symbolId = `#${prefix}-${name}`;

  return (
    <svg {...props} aria-hidden="true">
      <use href={symbolId} fill={color} />
    </svg>
  );
}
```

修改 header 组件

```ts
// index.tsx
const icons = import.meta.globEager("../../assets/icons/logo-*.svg");
const iconUrls = Object.values(icons).map((mod) => {
  // 如 ../../assets/icons/logo-1.svg -> logo-1
  const fileName = mod.default.split("/").pop();
  const [svgName] = fileName.split(".");
  return svgName;
});

// 渲染 svg 组件
{
  iconUrls.map((item) => (
    <SvgIcon name={item} key={item} width="50" height="50" />
  ));
}
```

在 main.tsx 中添加代码

```ts
import "virtual:svg-icons-register";
```
