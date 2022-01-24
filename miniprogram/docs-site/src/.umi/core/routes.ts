// @ts-nocheck
import React from 'react';
import { ApplyPluginsType } from '/Users/zhangzhen/myproject/sharing/miniprogram/node_modules/@umijs/runtime';
import * as umiExports from './umiExports';
import { plugin } from './plugin';

export function getRoutes() {
  const routes = [
  {
    "path": "/~demos/:uuid",
    "layout": false,
    "wrappers": [require('/Users/zhangzhen/myproject/sharing/miniprogram/node_modules/@umijs/preset-dumi/lib/theme/layout').default],
    "component": (props) => {
        const { default: getDemoRenderArgs } = require('/Users/zhangzhen/myproject/sharing/miniprogram/node_modules/@umijs/preset-dumi/lib/plugins/features/demo/getDemoRenderArgs');
        const { default: Previewer } = require('dumi-theme-default/es/builtins/Previewer.js');
        const { default: demos } = require('@@/dumi/demos');
        const { usePrefersColor } = require('dumi/theme');

        
      const renderArgs = getDemoRenderArgs(props, demos);

      // for listen prefers-color-schema media change in demo single route
      usePrefersColor();

      switch (renderArgs.length) {
        case 1:
          // render demo directly
          return renderArgs[0];

        case 2:
          // render demo with previewer
          return React.createElement(
            Previewer,
            renderArgs[0],
            renderArgs[1],
          );

        default:
          return `Demo ${props.match.params.uuid} not found :(`;
      }
    
        }
  },
  {
    "path": "/_demos/:uuid",
    "redirect": "/~demos/:uuid"
  },
  {
    "__dumiRoot": true,
    "layout": false,
    "path": "/",
    "wrappers": [require('/Users/zhangzhen/myproject/sharing/miniprogram/node_modules/@umijs/preset-dumi/lib/theme/layout').default, require('/Users/zhangzhen/myproject/sharing/miniprogram/node_modules/dumi-theme-default/es/layout.js').default],
    "routes": [
      {
        "path": "/",
        "component": require('/Users/zhangzhen/myproject/sharing/miniprogram/docs/index.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/index.md",
          "updatedTime": 1639129475843,
          "title": "前言",
          "slugs": [
            {
              "depth": 2,
              "value": "前言",
              "heading": "前言"
            },
            {
              "depth": 3,
              "value": "1.小程序的由来",
              "heading": "1小程序的由来"
            },
            {
              "depth": 3,
              "value": "2.小程序的特征",
              "heading": "2小程序的特征"
            }
          ]
        },
        "title": "前言 - CBI-FE Share"
      },
      {
        "path": "/develop/develop",
        "component": require('/Users/zhangzhen/myproject/sharing/miniprogram/docs/develop/develop.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/develop/develop.md",
          "updatedTime": 1639130624664,
          "title": "后台管理",
          "order": 1,
          "nav": {
            "title": "小程序生态",
            "order": 1
          },
          "slugs": [
            {
              "depth": 3,
              "value": "1.小程序管理台页面",
              "heading": "1小程序管理台页面"
            },
            {
              "depth": 3,
              "value": "2.小程序开发工具",
              "heading": "2小程序开发工具"
            }
          ],
          "group": {
            "path": "/develop",
            "title": "小程序生态"
          }
        },
        "title": "后台管理 - CBI-FE Share"
      },
      {
        "path": "/extend/extend",
        "component": require('/Users/zhangzhen/myproject/sharing/miniprogram/docs/extend/extend.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/extend/extend.md",
          "updatedTime": 1639039668614,
          "title": "小程序框架、跨端研发、云开发",
          "order": 999,
          "nav": {
            "title": "扩展",
            "order": 10
          },
          "slugs": [
            {
              "depth": 2,
              "value": "1.小程序框架",
              "heading": "1小程序框架"
            },
            {
              "depth": 3,
              "value": "1.1 mpvue 使用Vue.js开发小程序",
              "heading": "11-mpvue-使用vuejs开发小程序"
            },
            {
              "depth": 3,
              "value": "1.2  Chameleon 变色龙-跨端统一解决方案",
              "heading": "12--chameleon-变色龙-跨端统一解决方案"
            },
            {
              "depth": 3,
              "value": "1.3 - Taro 支持React/Vue/Nerv等框架开发的跨端小程序框架",
              "heading": "13---taro-支持reactvuenerv等框架开发的跨端小程序框架"
            },
            {
              "depth": 3,
              "value": "1.4 - wepy 小程序最早的框架之一",
              "heading": "14---wepy-小程序最早的框架之一"
            },
            {
              "depth": 3,
              "value": "1.5 - Kbone 一个致力于微信小程序和 Web 端同构的解决方案",
              "heading": "15---kbone-一个致力于微信小程序和-web-端同构的解决方案"
            },
            {
              "depth": 3,
              "value": "1.6 - Megalo 支持微信小程序，支付宝小程序，百度智能小程序，字节跳动小程序",
              "heading": "16---megalo-支持微信小程序支付宝小程序百度智能小程序字节跳动小程序"
            },
            {
              "depth": 3,
              "value": "1.7 - uniapp 一套代码编到13个平台",
              "heading": "17---uniapp-一套代码编到13个平台"
            },
            {
              "depth": 2,
              "value": "2.云托管",
              "heading": "2云托管"
            },
            {
              "depth": 3,
              "value": "2.1什么是云托管",
              "heading": "21什么是云托管"
            },
            {
              "depth": 3,
              "value": "2.2云托管特性",
              "heading": "22云托管特性"
            },
            {
              "depth": 3,
              "value": "2.3云托管的优势",
              "heading": "23云托管的优势"
            }
          ],
          "group": {
            "path": "/extend",
            "title": "扩展"
          }
        },
        "title": "小程序框架、跨端研发、云开发 - CBI-FE Share"
      },
      {
        "path": "/framework/lifecycle",
        "component": require('/Users/zhangzhen/myproject/sharing/miniprogram/docs/framework/lifecycle.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/framework/lifecycle.md",
          "updatedTime": 1639129497361,
          "title": "小程序底层架构",
          "order": 9,
          "nav": {
            "title": "框架"
          },
          "slugs": [
            {
              "depth": 3,
              "value": "1.小程序底层框架（MINA）",
              "heading": "1小程序底层框架mina"
            },
            {
              "depth": 3,
              "value": "2.小程序生命周期",
              "heading": "2小程序生命周期"
            },
            {
              "depth": 3,
              "value": "3.小程序Javascript运行环境",
              "heading": "3小程序javascript运行环境"
            },
            {
              "depth": 3,
              "value": "4.基本代码构成",
              "heading": "4基本代码构成"
            }
          ],
          "group": {
            "path": "/framework",
            "title": "框架"
          }
        },
        "title": "小程序底层架构 - CBI-FE Share"
      },
      {
        "path": "/guide/basic",
        "component": require('/Users/zhangzhen/myproject/sharing/miniprogram/docs/guide/basic.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/guide/basic.md",
          "updatedTime": 1639029221461,
          "title": "目录与代码",
          "order": 0,
          "toc": "menu",
          "nav": {
            "title": "示例",
            "order": 1
          },
          "slugs": [
            {
              "depth": 3,
              "value": "1. 目录结构",
              "heading": "1-目录结构"
            },
            {
              "depth": 3,
              "value": "2.代码示例",
              "heading": "2代码示例"
            }
          ],
          "group": {
            "path": "/guide",
            "title": "示例"
          }
        },
        "title": "目录与代码 - CBI-FE Share"
      },
      {
        "path": "/programmer/wxml",
        "component": require('/Users/zhangzhen/myproject/sharing/miniprogram/docs/programmer/wxml.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/programmer/wxml.md",
          "updatedTime": 1639130244852,
          "title": "WXML",
          "order": 1,
          "nav": {
            "title": "语法",
            "order": 2
          },
          "slugs": [
            {
              "depth": 3,
              "value": "1.语法与html保持一致",
              "heading": "1语法与html保持一致"
            },
            {
              "depth": 3,
              "value": "2.数据绑定",
              "heading": "2数据绑定"
            },
            {
              "depth": 3,
              "value": "3.列表渲染",
              "heading": "3列表渲染"
            },
            {
              "depth": 3,
              "value": "4.条件渲染",
              "heading": "4条件渲染"
            },
            {
              "depth": 3,
              "value": "5,模板",
              "heading": "5模板"
            }
          ],
          "group": {
            "path": "/programmer",
            "title": "语法"
          }
        },
        "title": "WXML - CBI-FE Share"
      },
      {
        "path": "/programmer/wxs",
        "component": require('/Users/zhangzhen/myproject/sharing/miniprogram/docs/programmer/wxs.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/programmer/wxs.md",
          "updatedTime": 1639037981704,
          "title": "WXS（WeiXin Script)",
          "slugs": [
            {
              "depth": 3,
              "value": "1.wxs标签",
              "heading": "1wxs标签"
            }
          ],
          "group": {
            "path": "/programmer",
            "title": "Programmer"
          }
        },
        "title": "WXS（WeiXin Script) - CBI-FE Share"
      },
      {
        "path": "/programmer/wxss",
        "component": require('/Users/zhangzhen/myproject/sharing/miniprogram/docs/programmer/wxss.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/programmer/wxss.md",
          "updatedTime": 1639129865967,
          "title": "wxss",
          "slugs": [
            {
              "depth": 2,
              "value": "wxss -css的子集",
              "heading": "wxss--css的子集"
            },
            {
              "depth": 3,
              "value": "1. wxss 支持的选择器",
              "heading": "1-wxss-支持的选择器"
            }
          ],
          "group": {
            "path": "/programmer",
            "title": "Programmer"
          }
        },
        "title": "wxss - CBI-FE Share"
      },
      {
        "path": "/qa/qa",
        "component": require('/Users/zhangzhen/myproject/sharing/miniprogram/docs/qa/qa.md').default,
        "exact": true,
        "meta": {
          "filePath": "docs/qa/qa.md",
          "updatedTime": 1638962644991,
          "title": "常用API",
          "order": 1,
          "toc": "menu",
          "nav": {
            "title": "常见问题",
            "order": 1
          },
          "slugs": [
            {
              "depth": 3,
              "value": "1.如何区分小程序当前运行环境(开发、体验、生产)",
              "heading": "1如何区分小程序当前运行环境开发体验生产"
            },
            {
              "depth": 3,
              "value": "2.如何在小程序中展示loading/toast",
              "heading": "2如何在小程序中展示loadingtoast"
            },
            {
              "depth": 3,
              "value": "更多API体验",
              "heading": "更多api体验"
            }
          ],
          "group": {
            "path": "/qa",
            "title": "常见问题"
          }
        },
        "title": "常用API - CBI-FE Share"
      },
      {
        "path": "/develop",
        "meta": {},
        "exact": true,
        "redirect": "/develop/develop"
      },
      {
        "path": "/extend",
        "meta": {},
        "exact": true,
        "redirect": "/extend/extend"
      },
      {
        "path": "/framework",
        "meta": {},
        "exact": true,
        "redirect": "/framework/lifecycle"
      },
      {
        "path": "/guide",
        "meta": {},
        "exact": true,
        "redirect": "/guide/basic"
      },
      {
        "path": "/programmer",
        "meta": {},
        "exact": true,
        "redirect": "/programmer/wxml"
      },
      {
        "path": "/qa",
        "meta": {},
        "exact": true,
        "redirect": "/qa/qa"
      }
    ],
    "title": "CBI-FE Share",
    "component": (props) => props.children
  }
];

  // allow user to extend routes
  plugin.applyPlugins({
    key: 'patchRoutes',
    type: ApplyPluginsType.event,
    args: { routes },
  });

  return routes;
}
