参数,

```javascript
/**
 * @param {boolean} needShareline 是否需要分享到朋友圈
 * @param {boolead} needLogin 是否需要登录
 */
```

在需要转发的地方使用button,并添加上属性`openType='share'`  ,然后注意UI变化,要给button添加属性`plain=true` ,将button设置为镂空样式,取消button的内外边距和边框

在需要注入的页面通过`@withShare({})` 的方式引入,并将需要的参数传入

如果设置的分享给朋友无效,可以在页面的config.js中配置  `enableShareAppMessage: true`, 同理如果分享到朋友圈无效，可以配置enableShareTimeline: true` 


需要定义`getShareData` 方法,将必要的参数返回

参数`Object:object` 

| 参数 | 类型            | 说明                                                         |
| ---- | --------------- | ------------------------------------------------------------ |
| from | Array.\<string> | "menu"：来自右上角分享给朋友<br />"timeLine"：来自右上角分享到朋友圈 |

可以在`button` 上绑定自定义属性,绑定的自定义的属性的名称必须是`data-shareData` ,然后就可以在该参数中取到,进一步操作。

有时需要这样做,因为一个页面上有多个分享按钮时,无法判断来自哪个分享按钮,

当返回值时,也可以直接在按钮上绑定需要的值,例如`title`, `path` ,然后直接在`getShareData` 中取到,或者直接在方法中从`store` 中取值

返回值`Object:onject`

| 参数     | 类型   | 说明               | 必填                                     |
| -------- | ------ | :----------------- | ---------------------------------------- |
| title    | String | 页面的标题         | 是                                       |
| path     | String | 分享的页面路径     | 点击右上角分享到朋友圈,不必填,其他必填 |
| imageUrl | String | 分享到朋友圈缩略图 | 点击右上角分享到朋友圈,必填,其他不必填 |

实例

```html
<Button plain='true' openType='share' data-shareData={shareData}>
              <Icon className={styles.shareIcon}name="ShareAltOutlined" size={14} />
              <Text className={styles.text}>分享</Text>
</Button>
```

```javascript
//pages/index.js
getShareData (data) {
    const { topic } = this.props 
    const topicId = topic.topicDetail?.pageData[0]?.topicId || ''
    const defalutTitle = topic.topicDetail?.pageData[0]?.content || ''
    const defalutPath = `/subPages/topic/topic-detail/index?id=${topicId}`
    //处理点击分享到朋友圈
    if(data.from === 'timeLine') {
      return {
        title:defalutTitle
      }
    }
  	//处理点击右上角分享给朋友
    if (data.from === 'menu') {
      return {
        title:defalutTitle,
        path:defalutPath
      }
    }
    const { title, path, comeFrom, threadId } = data
    //根据button上的自定义属性判断是否来自帖子部分的分享,然后完成帖子部分的业务,分享后加一
    if(comeFrom && comeFrom === 'thread') {
      const { user } = this.props
      this.props.index.updateThreadShare({ threadId }).then(result => {
      if (result.code === 0) {
          this.props.index.updateAssignThreadInfo(threadId, { updateType: 'share', updatedInfo: result.data, user: user.userInfo });
          this.props.search.updateAssignThreadInfo(threadId, { updateType: 'share', updatedInfo: result.data, user: user.userInfo });
          this.props.topic.updateAssignThreadInfo(threadId, { updateType: 'share', updatedInfo: result.data, user: user.userInfo });
      }
    });
    }
  //将必须要得值返回
    return {
      title,
      path
    }
  }
```

