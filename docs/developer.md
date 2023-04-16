## 使用

建议使用git clone命令进行下载，方便后续更新。

```bash
$ git clone https://gitee.com/Discuz/discuz-fe.git
```

## 小程序构建

- ~~修改`mini/project.config.json`文件中的appid为自己的appid~~（废弃）
- ~~修改`common/config/prod.js`中的域名指向~~（废弃）
- discuz-fe文件目录下，`dzq.config.yaml`是整个Discuz!Q3.0的环境配置文件
  - 修改HOST，将修改你的应用的域名指向
  - 修改APPID，将修改你的appid

```yaml
TITLE: Discuz!Q
HOST: 【你的域名】
APPID: 【你的appid】
VERSION: v3.0.210729
```

- 进行小程序编译

```bash
$ cd ./mini
$ npm run build:weapp
```

## 本地开发

```bash
# web 端本地开发
$ cd ./web
$ npm install
$ npm run dev

# 小程序端本地开发
$ cd ./mini
$ npm install
$ npm run dev:weapp
```

## 目录结构

```bash
|- common             # 小程序和 web 端公用的一些内容
| |- config           # 项目编译配置
| | |- dev.js             # 开发环境配置文件
| | |- index.js           # 默认配置
| | |- prod.js            # 生产环境配置文件
| |- constants        # 常量
| | |- site.js            # 项目构建时通过 defineConstants 定义的变量存放在此处
| | |- ...             # 项目中
| |- server           # 请求
| |- store            # 数据状态管理
| | |- app                # 项目的全局状态管理，比如：主题、页面状态等
| | |- site               # 项目中的基本状态管理，比如：构建时定义的变量
| | |- index              # 页面的状态管理
| | |- ...
| |- styles           # 样式
| | |- mixin              # mixin
| | |- theme              # 主题
| | |- pages              # 页面样式
| | | |- index
| | | | |- h5.scss
| | | | |- pc.scss
| | | |- ...
| | |- var.scss
| |- utils            # 工具库
|- mini               # 小程序项目
| |- src                # 小程序源代码
| | |- components
| | |- pages            # 页面
| | | |- ...
| | |- styles           # 样式
| |- app.config.js      #
| |- app.jsx            # 入口文件
| |- app.scss           # 入口样式
|- web                # web 项目
| |- layout             # 页面布局
| |- pages              # 页面
| | |- ...
| | |- _app.jsx         # 入口
| |- styles             # 样式
```

## 开发规范

1. [命名规范](./docs/naming.md)
2. 共用部分说明：
- 数据状态管理（`common/store`）：`mini`（小程序）和 `web`（Web 端：H5 | PC）公有一套数据状态。
- 服务请求（`common/server`）
- 常量（`common/constants`）
- 样式（`common/styles`）
  - 共用样式：mixin、变量、主题等
  - 页面样式（PC和移动端在样式上会有差别，所以写样式的时候注意区别以及共用的部分）：
    - 1）移动端：h5 和小程序共用
    - 2）PC
- 工具函数（`common/utils`）
3. [样式规范](./docs/css.md)