# CSS 规范

> 目前项目中使用 CSS 变量进行主题切换，因此此规范主要是针对公共变量的定义的一个约束，帮助我们能够规范定义以及方便共用

## 使用者注意

1. 组件或者页面中所有的颜色以及使用到的间距等都需要从 `common/styles/_variable.scss` 里面取，如果此文件中没有的请及时和负责人说，让负责人进行补充。
  - 业务中用到的颜色以及字体、层级关系、间距等都从此变量文件中获取，不要直接在业务中存在css变量的使用
  - 找不着的颜色请联系邹玉薇

2. 使用时，只用在样式文件头部导入即可，代码：`@import '@common/styles/index.scss';`

## 目录结构定义

```
|-- common
  | |-- styles
  | | |-- fn                  scss 函数
  | | | |-- _rem.scss           px转换为rem
  | | | |-- index.scss          入口文件
  | | | |-- ... ...
  | | |-- mixin               scss mixin函数
  | | | |-- _text.scss          关于文本处理的mixin函数
  | | | |-- index.scss          入口文件
  | | | |-- ... ...
  | | |-- theme               scss map 主题（这里后期应该考虑异步载入）
  | | | |-- dark.scss
  | | | |-- default.scss
  | | | |-- ... ...
  | | | |-- index.scss          主题入口文件（请不要在站点项目入口文件之外进行引入，避免重复）
  | | |-- variable            scss 变量，如果是以多文件的形式就需要此文件夹，否则单个文件即可（基于主题变量）
  | | | |-- index.scss          入口文件
  | | | |-- _font-size.scss
  | | | |-- _color.scss
  | | | |-- .. ...
  | | |-- _variable.scss      或者变量都存放在一个单文件中
  | | |-- index.scss          入口文件（只会包含 fn、mixin、variable 三个文件夹中的文件供站点使用）
```

### SCSS 函数

`common/styles/fn` 文件夹下存放公共使用的 SCSS 函数

### SCSS Mixin 函数

`common/styles/mixin` 文件夹下存放公共使用的 SCSS mixin 函数

### 主题变量

> 请注意：只需要站点入口或者异步直接载入即可，不用在每个使用的文件中都引入

注：基础颜色没有的的需要及时反馈，由负责人找设计师对稿清楚之后填写到此处。（这个和目前的命名有很大的差别，看是否统一都调整，还是按照目前的来进行。这里还会涉及到组件）

`common/styles/theme` 主题主要用途是用于站点的主题切换，因此应该只会涉及到基础颜色和字体。基础颜色会使用对应颜色进行命名。现有的 scss 基础变量会改写成如下：

```scss
$roots: (
  // 颜色盘
  --color-primary: #2469f6,
  --color-primary2: #3978f7,
  --color-primary3: #5087f8,
  --color-primary4: #6596f9,
  --color-primary5: #7ca5fa,
  --color-primary6: #91b4fa,
  --color-primary7: #a7c3fb,
  --color-primary8: #bdd2fc,
  --color-primary9: #d3e1fd,
  --color-primary10: #e9f0fe,
  --color-success: #57bd6a,
  --color-success2: #79ca88,
  --color-success3: #abdeb4,
  --color-success4: #ccebd2,
  --color-success5: #eef8f0,
  --color-info: #5087f8,
  --color-info2: #739ff9,
  --color-info3: #a7c3fb,
  --color-info4: #cadbfd,
  --color-info5: #edf3fe,
  --color-error: #e02433,
  --color-error2: #e6505c,
  --color-error3: #ef9199,
  --color-error4: #f6bdc1,
  --color-error5: #fce9ea,
  --color-warn: #f6c443,
  --color-warn2: #f8d069,
  --color-warn3: #fae1a1,
  --color-warn4: #fcedc6,
  --color-warn5: #fef9ec,
  --color-disabled: #c5c6cb,
  --color-disabled2: #d0d1d5,
  --color-disabled3: #dcdde0,
  --color-disabled4: #e8e8ea,
  --color-disabled5: #f4f4f5,
  --color-white: #fff,
  --color-black: #000,
);
```

### SCSS 变量命名规范

> 说明：所有的共有变量都写在这里

`common/styles/variable` 文件夹下面存放定义的 SCSS 变量。这里的变量会包括颜色、字体大小、间距、边框等。这里的变量会分为两种类型。一个是基础变量、一个是模块变量。

#### 文件命名

- 命名方式：连接符全小写命名法
- 命名规范：前缀以下划线开头
- 命名建议：尽量在文件名字中体现该文件的主要用途

1. 基础变量（模块会用到的一些变量）

基础变量包括

- `_theme.scss` 主题色（primary，info，warn，success，error）：主要用于按钮，标签，提示
- `_bg.scss` 背景色
- `_font.scss` 字体、字体大小
- `_text.scss` 文本相关变量
- `_link.scss` 链接文字变量
- `_space.scss` 间距，包括：padding、margin
- `_z-index.scss` 层级关系
- `_border.scss` 边框
- `_box-shadow` 边框阴影
- `_disable.scss`  禁用态
- `_icon.scss` icon 颜色
- ... ...

2. 模块变量（主要针对于组件或者业务模块，比如：输入框、按钮等）
- `_input.scss`
- `_button.scss`
- `_image.scss`
- ... ...

#### 变量命名

- 命名方法：连接符全小写命名法
- 命名规范：[模块|css属性]  + [描述|css伪元素|平台]，如有多个相同的，可以配合数字来命名
  - 模块，比如：body，image，input，link 等；
  - css属性，比如：border，font-size，box-shadow 等；
  - 描述（大小、颜色、形状等），比如：
    - 大小：small，middle，large；
    - 基本：base
  - 伪元素，比如：hover，focus，active
  - 平台，比如：pc

示例如下：

```scss
// 只是举例哈
// ----- 基本颜色 ----------
$black: var(--color-black);
$white: var(--color-white);
$error-color: var(--color-error2);
$warning-color: var(--color-warn2);

// ----- 主题颜色（primary，info，warn，success，error）：主要用于按钮，标签，提示的背景 ----
$primary-1: var(--color-primary);
$primary-2: var(--color-primary2);

// ----- body 背景 -----
$body-bg: $white;
$body-bg-pc: var(--color-disabled5);

// ----- 字体 -----
$font-family: 'PingFang SC', 'BlinkMacSystemFont', 'Helvetica Neue', 'Arial', 'Hiragino Sans GB', 'STHeiti', 'Microsoft YaHei', 'Microsoft JhengHei', 'Source Han Sans SC', 'Noto Sans CJK SC', 'Source Han Sans CN', 'Noto Sans SC', 'Source Han Sans TC', 'Noto Sans CJK TC', 'WenQuanYi Micro Hei', 'SimSun', sans-serif;

$font-size-small: 12px;
$font-size-base: 14px;
$font-size-middle: 16px;
$font-size-large: 20px;

// ------ 等等 -----------

```

#### 如何组织变量

这里会有两种组织形式：
1. 一个是每一个独立的模块有属于自己的文件，在对应的文件中进行变量定义。
2. 第二种方式就是直接在一个文件中进行全部的变量定义，通过注释来分清楚模块。

因为目前我们站点的变量应该不多，而且统一在同一个文件中管理会更加便于查找。
