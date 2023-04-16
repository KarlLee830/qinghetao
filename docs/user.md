## 使用

建议使用git clone命令进行下载，方便后续更新。

```bash
$ git clone https://gitee.com/Discuz/discuz-fe.git
```

## 安装项目依赖

```bash
$ cd discuz-fe
$ cd ./mini
$ npm install
```

如果遇到下载依赖失败可以尝试先运行如下命令,更改安装依赖的源地址
```bash
// 单次生效
$ npm install --registry=http://mirrors.cloud.tencent.com/npm/
// 永久生效
$ npm config set registry http://mirrors.cloud.tencent.com/npm/
```

## 小程序构建

- ~~修改`mini/project.config.json`文件中的appid为自己的appid~~（废弃）
- ~~修改`common/config/prod.js`中的域名指向~~（废弃）
- discuz-fe文件目录下，`dzq.config.yaml`是整个Discuz! Q3.0的环境配置文件
  - 修改HOST，将修改你的应用的域名指向
  - 修改APPID，将修改你的appid

```yaml
TITLE: Discuz! Q
HOST: 【你的域名】
APPID: 【你的appid】
VERSION: v3.0.210729
```

- 进行小程序编译

```bash
$ cd ./mini
$ npm install
$ npm run build:weapp
```

## 如何更新

### 使用git下载代码

使用命令行进入本仓库目录，运行以下命令

```bash
// 更新仓库代码
$ git pull origin master

// 更新dzq3.0核心依赖
$ npm run update

// 更新其他依赖
$ npm install

// 重新构建
$ npm run build:weapp
```

### 注意！！！
如果修改过你小程序的域名和appid，在每一次拉取代码更新时，会存在`冲突`的情况导致无法成功更新代码。一般情况下会存在冲突的文件如下：
- ~~./mini/common/config/prod.js~~(废弃)
- ~~./mini/project.config.json~~(废弃)
- ./discuz-fe/dzq.config.yaml
- ./mini/project.config.json

可以通过以下命令将修改的代码暂时保存起来，更新后再恢复。
```bash
$ git add .
$ git stash

// 运行代码更新
$ git pull origin master

// 恢复你修改的配置
$ git stash pop

// 更新dzq3.0核心依赖
$ npm run update

// 更新其他依赖
$ npm install

// 重新构建
$ npm run build:weapp
```

### 使用zip下载代码

如果使用zip下载代码包，运行以下命令

```bash
// 更新其他依赖
$ npm install

// 重新构建
$ npm run build:weapp
```

## 发布

编译后的小程序源代码在`mini/dist`下，可以直接使用`微信开发者工具`打开后进行提交审核

## 常见问题

如果遇到以下问题：
```bash
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
npm ERR! 
npm ERR! While resolving: discuz-app-mini@0.0.1-beta.3
npm ERR! Found: react@17.0.1
npm ERR! node_modules/react
npm ERR!   react@"17.0.1" from the root project
npm ERR! 
npm ERR! Could not resolve dependency:
npm ERR! peer react@"^16.8.0 || 16.9.0-alpha.0" from mobx-react@6.1.4
npm ERR! node_modules/mobx-react
npm ERR!   mobx-react@"6.1.4" from the root project
npm ERR! 
npm ERR! Fix the upstream dependency conflict, or retry
npm ERR! this command with --force, or --legacy-peer-deps
npm ERR! to accept an incorrect (and potentially broken) dependency resolution.
npm ERR! 
npm ERR! See /Users/xxx/.npm/eresolve-report.txt for a full report.

npm ERR! A complete log of this run can be found in:
npm ERR!     /Users/xxx/.npm/_logs/2021-07-02T17_24_15_418Z-debug.log
```

这是因为node的版本太高`（高于14）`，请暂时使用node 14版本来编译。

如果你使用的是M1芯片的Mac，请先安装NVM，然后使用NVM来安装ARM版本的node 14

```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
$ nvm install v14
$ node -v
```