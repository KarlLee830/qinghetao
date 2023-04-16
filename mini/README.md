# Discuz! Q (mini)

> Discuz! Q 小程序站点项目工程

![node version](https://img.shields.io/badge/node-%3E%3D10.13.0-blue)
![MobX 4](https://img.shields.io/badge/MobX-4.15.4-brightgreen)
![Taro 3](https://img.shields.io/badge/Taro-3.1.1-brightgreen)

## 构建命令

```bash
// 本地开发
npm run dev:weapp

// 构建小程序
npm run build:weapp
```

## 目录结构

```bash
|- config               # 项目编译配置
| |- dev.js             # 开发环境配置文件
| |- index.js           # 默认配置
| |- prod.js            # 生产环境配置文件
|- src                  # 源代码
| |- components         # 公共业务组件
| | |- ...
| |- pages              # 页面
| | |- index
| | | |- components     # 独属于该页面的组件
| | | |  |- ...     
| | | |- index.jsx      # 页面入口文件
| | | |- index.module.scss # 样式文件
| | |- ...
| |- subPages              # 子模块页面
| |- styles             # 样式
| | |- index.scss         # 样式入口文件
| | |- reset.scss         # 重置样式
| |- utils              # 共用的工具函数
| |- app.config.js      # 应用页面配置入口文件
| |- app.jsx            # 全局入口文件
| |- app.scss           # 全局样式入口
| |- public             # 资源文件
| | |- images           # 图片资源
```

## 图片文件配置

以后请不要使用 CDN，如果要使用找dzq总负责人进行沟通说明原因。如果要使用一些图片资源，请放到 `web/public/assets`  目录。温馨提示：对于使用的图片请务必一定要压缩一下。压缩可以使用：https://tinypng.com/

使用时域名为项目配置`dzq.config.yaml`文件中的`HOST`，例如`test.png`，文件部署后使用方式如下：

```js
import { IMG_SRC_HOST } from '@common/constants/site';
const imgUrl = `${IMG_SRC_HOST}/assets/test.png`;
```

## 环境配置

通过 `config` 文件夹中的文件中的 `defineConstants`。具体请看：[taro defineConstants](https://taro-docs.jd.com/taro/docs/next/config-detail#defineconstants)。

## 数据状态管理

使用 [`MobX 4`](https://cn.mobx.js.org) 进行数据状态管理，具体使用文档请看：[MobX 4 API](https://cn.mobx.js.org/refguide/api.html)。

## 页面开发规范


1. 页面分包问题
> 说明:
> 分包的入口文件：`./src/app.config.js`
> 分包打包优化：`./config` 文件夹下面的文件
- 主包：只包含首页和详情页
- 子包：除首页和详情页和个人中心的包都在子包

## 布局单位

设计稿按照 `375px` 进行设计。在项目中尺寸单位建议使用 px、 百分比 %，Taro 默认会对所有单位进行转换。

## 样式编写

所有页面的样式文件，必须以`xxx.module.scss`进行编写。Discuz!Q作为一个SPA应用，将使用`SCSS Module`来实现样式作用域保护。

### 颜色
所有的验收单位必须使用符合当前theme的颜色标准

### 尺寸
所有尺寸必须使用common中定义的scss变量进行使用

## 引用规则

提供快速引用指定目录的方式。

- @components->mini目录下的components文件
- @layout->mini目录下的layout文件
- @utils->mini目录下的utils文件
- @pages->mini目录下的pages文件
- @config->mini目录下的config文件
- @common->mini目录以外的common目录
- @store->mini目录以外的common目录下的store文件
- @server->mini目录以外的common目录下的server文件


## 依赖
- [Taro 3](http://taro-docs.jd.com/taro/docs/README)
- [MobX 4](https://cn.mobx.js.org/)

## 目录规范
- 文件使用`-`进行分割，例如:is-login
- 变量名称统一使用小驼峰命名
- 组件名称必须使用大驼峰命名