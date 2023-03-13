# Nodejs

官网是这么解释 Nodejs 的

- Node.js® is an open-source, cross-platform JavaScript runtime environment.

翻译过来：Node.js 是一个开源的、跨平台的 JavaScript 运行时环境。这里要敲黑板划重点了，_`JavaScript 运行时环境`_

## JavaScript 运行时环境

Node.js 并不是语言，而是一个 JavaScript 运行时环境，它的语言是 JavaScript。这就跟 PHP、Python、Ruby 这类不一样，它们既代表语言，也可代表执行它们的运行时环境（或解释器）。

Node.js 与 JavaScript 真要按分层说，大概是这么个意思

运行时环境： | Chromium | Node.js | Deno | Firefox----- | .......................... |
执行引擎： | ---------Chrome V8--------- | SpiderMonkey | QuickJS | ................ |
语言实现： | -----------------------JavaScript------------------ | ActionScript|.... |
脚本语言规范： | --------------------ECMAScript-------------------------------------- |

这里我们从下往上梳理。

最下面一层是脚本语言规范（Spec） ，由于我们讲的是 Node.js，所以这里最下层只写 ECMAScript。

再往上一层就是对于该规范的实现了，如 JavaScript、ActionScript 等都属于对 ECMAScript 的实现。

然后就是执行引擎，JavaScript 常见的引擎有 V8、SpiderMonkey、QuickJS 等

最上面就是运行时环境了，比如基于 V8 封装的运行时环境有 Chromium、Node.js、Deno 等等。而我们所说的 Node.js 就是在运行时环境这一层。

可以看到，JavaScript 在第二层，Node.js 则在第四层。

## Node.js 思潮

Node.js 能做什么？答案随着时间推移一直在变化

在 Node.js 创造之初，主推的是“单线程”“天然异步 API”下的高性能运行时。单线程，意味着业务逻辑不用考虑各种锁的问题；天然异步 API，意味着可以方便地处理并发。这种方式自然适合做服务端。

Node.js 提供了基于事件驱动和非阻塞的接口，可用于编写高并发状态下的程序，而且 JavaScript 的匿名函数、闭包、回调函数等特性就是为事件驱动而设计的。

Node.js 的一些内置模块如 http、net、fs 等，就是为服务端设计的。无论是 HTTP 服务端，还是其他一些 TCP、UDP 的服务端。

各种框架开始冒出，最有名的如 Express.js、Koa.js 等。

与其说框架，Express.js 和 Koa.js 更像是对于 HTTP 服务端 API 的上层封装，实际上远没到框架级别。

除了 HTTP 服务，RPC 服务自然也是可以的。

各种 RPC 的服务在各大公司都有各自的最佳实践。

其实 RPC 与 HTTP 类似，都是要异步处理并发。只不过可能在长短连接上会有不同，在协议的序列化与反序列化上不一样而已。各种社区流行的 RPC 协议也都有 Node.js 的 SDK，如 gRPC 等。

除了服务端外，Node.js 提供的形如 tty、repl、readline 等内置模块，同时又为创造各种工具提供了方便的能力。

前端生态也因此变得庞大，虽然现在 Rust 开始乱入，但泛前端领域自身的 CLI 大抵都还是 Node.js 写的。

都说 2011、2012 年左右 Node.js 在国内开始萌芽，2013、2014 年开始爆炸，其实是差不多的

Node.js 还有一个用途就是桌面端。一路发展过来，从 NW.js（前身 node-webkit）到 Electron.js（前身 Atom Shell），以及之前网易也搞过一个叫 heX 的桌面端运行时，之前的有道词典就是基于他们自己的 heX 开发的。heX 一样也是诞生于百花齐放、神仙打架的年代，2013 年。那个时候 Node.js 的土壤简直不要太好。其实很多有名的软件都是基于 Electron 开发的，比如微软的代码编辑器 Visual Studio Code，又比如 1Password、钉钉等

Node.js 的趋势越来越往前端生态的补足发展，加上桌面端领域，统称泛前端，服务端领域日渐式微。

这个时间点基本上就是在 Node.js 合并快速发展的一两年左右，也就是 2017、2018 年左右。

后来 Serverless 出现了，Node.js 再次迎来一波焕新。相较于其他的运行时（比如 Java），它在冷启动速度上有着绝对的优势，所占资源也小很多。

## Node.js 与 Web-interoperable Runtime

Web-interoperable Runtime 简称 Winter，Web 可互操运行时。这里有一个核心的单词叫 interoperable，就是可互操。什么是可互操？就是运行时之间是可以互相替代、互相兼容的。各种浏览器之间就是 interoperable，经过标准化之后，大家 API 长的都一样，这就是所谓的互通性。

Winter 就是针对服务端 JavaScript 提出的一种规范。只要大家都遵循了 Winter 规范，那么整个生态又是可共享的。因为好多厂商都基于 V8 做了 JavaScript 的运行时，但是后来经过标准化、规范化之后，国际上的几家厂商就一起给它起了一个新的名字，并且开始做一些标准化的事情，组建了一个组织叫做 WinterCG（Web-interoperable Runtimes Community Group），它是由几家国际公司联合起来搞的 W3C 下的一个社区组，致力于做 Web-interoperable Runtime 标准化。
