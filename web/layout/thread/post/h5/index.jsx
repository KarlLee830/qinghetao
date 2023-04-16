/* eslint-disable spaced-comment */
/**
 * 创建帖子页面
 */
import React from 'react';
import { inject, observer } from 'mobx-react';
import DVditor from '@components/editor';
import { AttachmentToolbar, AttachmentToolbarer, AttachmentToolbarsan, AttachmentToolbarsans,  AttachmentToolbarsi, DefaultToolbar, DefaultToolbarsan } from '@components/editor/toolbar';
import ToolsCategory from '@components/editor/tools/category';
import Emoji from '@components/editor/emoji';
import ImageUpload from '@components/thread-post/image-upload';
import { defaultOperation } from '@common/constants/const';
import FileUpload from '@components/thread-post/file-upload';
import { THREAD_TYPE } from '@common/constants/thread-post';
import { Audio, AudioRecord, Icon, Toast } from '@discuzqsdk/design';
import ClassifyPopup from '@components/thread-post/classify-popup';
import ProductSelect from '@components/thread-post/product-select';
import Product from '@components/thread-post/product';
import RewardQa from '@components/thread-post/reward-qa';
import styles from './index.module.scss';
import Title from '@components/thread-post/title';
import Position from '@components/thread-post/position';
import AtSelect from '@components/thread-post/at-select';
import TopicSelect from '@components/thread-post/topic-select';
import RedpacketSelect from '@components/thread-post/redpacket-select';
import PostPopup from '@components/thread-post/post-popup';
import Payment from '@components/thread-post/payment';
import { withRouter } from 'next/router';
import { getVisualViewpost, getClientHeight } from '@common/utils/get-client-height';
import throttle from '@common/utils/thottle';
import Header from '@components/header';
import Router from '@discuzqsdk/sdk/dist/router';
import VideoDisplay from '@components/thread-post/video-display';
import MoneyDisplay from '@components/thread-post/money-display';
import toolbarStyles from '@components/editor/toolbar/index.module.scss';
import TagLocalData from '@components/thread-post/tag-localdata';
import VoteWidget from '@components/thread-post/vote-widget';
import VoteEditor from '@components/thread-post/vote-editor';
import IframeVideo from '@components/thread-post/iframe-video';
import IframeVideoDisplay from '@components/thread-post/iframe-video-display';
import DZQPluginCenterInjectionPolyfill from '../../../../utils/DZQPluginCenterInjectionPolyfill';

// 插件引入
/**DZQ->plugin->register<plugin_post@post_extension_content_hook>**/

function judgeDeviceType() {
  const ua = window.navigator.userAgent.toLowerCase();
  const isIOS = /ip[honead]{2,4}(?:.*os\s([\w]+)\slike\smac|;\sopera)/i.test(ua);
  const isAndroid = /android/.test(ua);
  const isMiuiBrowser = /miuibrowser/i.test(ua);
  return {
    isIOS,
    isAndroid,
    isMiuiBrowser,
  };
}

function isIOSMiui() {
  // 判断是否是ios，或者小米默认浏览器
  // 小米默认浏览器键盘弹起问题
  return judgeDeviceType().isIOS || judgeDeviceType().isMiuiBrowser;
}

@inject('threadPost')
@inject('site')
@inject('index')
@inject('thread')
@inject('user')
@observer
class ThreadCreate extends React.Component {
  componentDidMount() {
    window.addEventListener('scroll', this.handler);
    window.addEventListener('resize', this.androidHandler);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handler);
    window.removeEventListener('resize', this.androidHandler);
  }

  handler = () => {
    if (!isIOSMiui()) return;
    throttle(this.setBottomBarStyle(window.scrollY), 50);
  }

  androidHandler = () => {
    // 如果是操作栏则不进行resize时间的判断
    if (this.props.currentDefaultOperation || this.props.currentAttachOperation) return;
    const winHeight = getVisualViewpost();
    if (!judgeDeviceType().isAndroid) return;
    if (window.innerHeight === winHeight) {
      this.clearBottomFixed();
    } else {
      this.props.handleSetState({ currentDefaultOperation: '' });
    }
  }

  // 定位的显示与影藏
  positionDisplay = (action) => {
    const position = document.querySelector('#post-position');
    if (!position) return;
    if (action === 'select') {
      position.style.display = 'none';
    } else position.style.display = 'flex';
  };

  // 设置悬赏等之后显示的金额的显示和影藏
  moneyboxDisplay = (isShow) => {
    const moneybox = document.querySelector('#dzq-money-box');
    if (!moneybox) return;
    if (isShow) moneybox.style.display = 'flex';
    else moneybox.style.display = 'none';
  }

  localdataTagDisplay = (isShow) => {
    const localdataTag = document.querySelector('#post-localdata');
    if (!localdataTag) return;
    if (isShow) localdataTag.style.display = 'block';
    else localdataTag.style.display = 'none';
  }

  // 设置底部bar的样式
  setBottomBarStyle = (y = 0, action, event) => {
    const winHeight = getVisualViewpost();
    // 阻止页面上拉带动操作栏位置变化。
    if (window.clientHeight === winHeight && judgeDeviceType().isIOS) return;
    // 如果可视窗口不变，即没有弹起键盘不进行任何设置
    const vditorToolbar = document.querySelector('#dzq-vditor .vditor-toolbar');
    this.positionDisplay(action);
    if (!isIOSMiui()) {
      if (vditorToolbar && action === 'select') {
        vditorToolbar.style.position = 'fixed';
        vditorToolbar.style.bottom = '88px';
        vditorToolbar.style.top = 'auto';
      }
    } else {
      if (vditorToolbar && action === 'select') {
        vditorToolbar.style.position = 'fixed';
        vditorToolbar.style.top = `${winHeight - 132 + y}px`;
      }
    }
    this.moneyboxDisplay(false);
    this.localdataTagDisplay(false);
    this.setPostBox(action, event, y);
  }

  setPostBox = (action, event, y) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      const winHeight = getVisualViewpost();
      const postBox = document.querySelector('#post-inner');
      const title = document.querySelector('#dzq-threadpost-title');
      const bottombarHeight = this.getBottombarHeight(action);
      let postBoxHeight = winHeight - bottombarHeight - 10; // 多减去10像素
      if (postBox) {
        if (title?.display !== 'none') postBoxHeight = winHeight - bottombarHeight - 54;
        postBox.style.height = `${postBoxHeight}px`;
      }
      if (event) {
        const clientY = event?.clientY;
        const offsetTop = event?.target?.offsetTop || 0;
        if (clientY > postBoxHeight) {
          this.props.handleEditorBoxScroller(offsetTop);
          // 解决focus在编辑器之后页面被弹出导致底部工具栏上移的问题
          if (isIOSMiui()) window.scrollTo(0, 0);
        }
      }
      // 这个需要放在这里的原因是避免滚动造成底部bar显示问题
      if (action !== 'clear') this.setPostBottombar(action, y);
    }, 0);
  };

  // 获取底部工具栏的高度
  getBottombarHeight = (action) => {
    const position = document.querySelector('#post-position'); // 高度35px
    const toolbar = document.querySelector('#dvditor-toolbar');
    const moneybox = document.querySelector('#dzq-money-box');
    let bottombarHeight = 123;
    if (action === 'select') bottombarHeight = 88;
    if (!position) bottombarHeight = 88;
    // 当表情显示的时候
    if (this.props.currentDefaultOperation === defaultOperation.emoji) {
      bottombarHeight += 218;
      if (toolbar) toolbar.className += ` ${toolbarStyles.emoji}`;
    } else {
      if (toolbar) toolbar.className = toolbarStyles['dvditor-toolbar'];
    }
    if (moneybox && moneybox?.style?.display !== 'none') bottombarHeight += 50; // 直接算最高的高度
    return bottombarHeight;
  }

  setPostBottombar = (action, y = 0) => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      const winHeight = getVisualViewpost();
      const postBottombar = document.querySelector('#post-bottombar');
      if (isIOSMiui()) {
        const bottombarHeight = this.getBottombarHeight(action);
        postBottombar.style.top = `${winHeight - bottombarHeight + y}px`;
      }
    }, 100);
  };

  setBottomFixed = (action, event) => {
    const timer = setTimeout(() => {
      if (timer) clearTimeout(timer);
      this.setBottomBarStyle(0, action, event);
    }, 150);
  }
  clearBottomFixed = () => {
    this.moneyboxDisplay(true);
    const timer = setTimeout(() => {
      if (timer) clearTimeout(timer);
      const postBottombar = document.querySelector('#post-bottombar');
      if (!postBottombar) return;
      this.positionDisplay();
      this.setPostBox('clear');
      postBottombar.style.top = 'auto';
      postBottombar.style.bottom = '0px';
      this.localdataTagDisplay(true);
    }, 300);
  }

  // 分类
  handleCategoryClick = () => {
    this.props.handleSetState({ categoryChooseShow: true, currentDefaultOperation: '' });
  };

  // 顶部导航栏点击后拦截回调
  handlePageJump = (link = '') => {
    const { postType, threadPost: { postData: { contentText, images, video, files, audio } } } = this.props;

    if (!this.props.checkAudioRecordStatus()) return;
    if (postType !== 'isEdit' && (contentText || video.id || audio.id || Object.values(images).length || Object.values(files).length)) {
      this.props.handleSetState({ draftShow: true, jumpLink: link });
      return;
    }

    if (link) {
      Router.push({ url: link });
    } else {
      window.history.length <= 1 ? Router.redirect({ url: '/' }) : Router.back();
    }
  }

  render() {
    const { threadPost, user, site } = this.props;
    const { threadExtendPermissions, permissions } = user;
    const { postData, setPostData } = threadPost;
    const { plugin } = postData;

    const { webConfig = {}, attachmentLimit = 9 } = site;
    const { setAttach, qcloud } = webConfig;
    const { supportImgExt, supportMaxSize } = setAttach;
    const { qcloudCosBucketName, qcloudCosBucketArea, qcloudCosSignUrl, qcloudCos } = qcloud;


    const { emoji, topic, atList, currentDefaultOperation, currentAttachOperation, categoryChooseShow } = this.props;

    return (
      <div className={styles['dzq-post-body']}>
        <Header allowJump={false} customJum={this.handlePageJump} />
        <div className={styles['post-inner']} id="post-inner" onClick={this.props.handleVditorFocus}>
          {/* 标题 */}
          {  webConfig.setSite.siteTitles === 1 && (
		    <Title
		      onClick={e => e.stopPropagation() }
		      isDisplay={this.props.isTitleShow}
		      title={postData.title}
		      onChange={title => this.props.setPostData({ title })}
		    />
		  )}
          {/* 编辑器 */}
          <DVditor
            value={postData.contentText}
            isResetContentText={postData.isResetContentText}
            emoji={emoji}
            atList={atList}
            topic={topic}
            onCountChange={count => this.props.handleSetState({ count })}
            onInput={vditor => this.props.handleVditorChange(vditor, 'input')}
            onChange={this.props.handleVditorChange}
            onFocus={(action, event) => {
              this.setBottomFixed(action, event);
              const operation = action === 'edior-focus'
                && this.props.currentDefaultOperation === defaultOperation.emoji ? defaultOperation.emoji : '';
              this.props.handleSetState({ isVditorFocus: true, currentDefaultOperation: operation });
            }}
            onBlur={() => {
              this.props.handleSetState({ isVditorFocus: false });
              this.clearBottomFixed();
            }}
            onInit={this.props.handleVditorInit}
            setState={this.props.handleSetState}
            site={site}
          />
          {/* 图片 */}
          {(currentAttachOperation === THREAD_TYPE.image || Object.keys(postData.images).length > 0) && (
            <ImageUpload
              cosOptions={{
                supportImgExt,
                supportMaxSize,
                qcloudCosBucketName,
                qcloudCosBucketArea,
                qcloudCosSignUrl,
                qcloudCos,
              }}
              className={styles.imageUpload}
              fileList={Object.values(postData.images)}
              onChange={fileList => this.props.handleUploadChange(fileList, THREAD_TYPE.image)}
              onComplete={(ret, file) => this.props.handleUploadComplete(ret, file, THREAD_TYPE.image)}
              beforeUpload = {(cloneList, showFileList) => this.props.beforeUpload(cloneList, showFileList, THREAD_TYPE.image)}
            />
          )}

          {/* 视频组件 */}
          {(postData.video && postData.video.thumbUrl) && (
            <VideoDisplay
              src={postData.video.thumbUrl}
              onDelete={() => this.props.setPostData({ video: {} })}
              onReady={this.props.onVideoReady} />
          )}
          {/* 外部视频iframe插入和上面的视频组件是互斥的 */}
          {(postData.iframe && postData.iframe.content) && (
            <IframeVideoDisplay
              content={postData.iframe.content}
              isDeleteShow
              h5
            />
          )}
          {/* 录音组件 */}
          {(currentAttachOperation === THREAD_TYPE.voice
            // && Object.keys(postData.audio).length > 0
            && !postData.audio.mediaUrl)
            && (
              <div className={styles['audio-record']} id="dzq-post-audio-record" onClick={e => e.stopPropagation()}>
                <AudioRecord
                  duration={60.4}
                  onUpload={(blob) => {
                    this.props.handleAudioUpload(blob);
                  }}
                  onRecordBegan={() => {
                    setPostData({ audioRecordStatus: 'began' });
                  }}
                  onRecordCompleted={() => {
                    setPostData({ audioRecordStatus: 'completed' });
                  }}
                  onRecordReset={() => {
                    setPostData({ audioRecordStatus: 'reset' });
                  }}
                />
              </div>
            )}

          {/* 语音组件 */}
          {(Boolean(postData.audio.mediaUrl)) && (
            <div className={`${styles['audio-record']} ${styles['audio-record-display']}`} onClick={e => e.stopPropagation()}>
              <Audio src={postData.audio.mediaUrl} />
              <Icon className={styles.delete} name="DeleteOutlined" onClick={() => this.props.setPostData({ audio: {} })} />
            </div>
          )}

          {/* 附件上传组件 */}
          {(currentDefaultOperation === defaultOperation.attach || Object.keys(postData.files).length > 0) && (
            <FileUpload
              limit={attachmentLimit}
              fileList={Object.values(postData.files)}
              onChange={fileList => this.props.handleUploadChange(fileList, THREAD_TYPE.file)}
              onComplete={(ret, file) => this.props.handleUploadComplete(ret, file, THREAD_TYPE.file)}
              beforeUpload = {(cloneList, showFileList) => this.props.beforeUpload(cloneList, showFileList, THREAD_TYPE.file)}
            />
          )}

          {/* 投票组件 */}
          {(postData?.vote?.voteTitle) && (
            <VoteWidget onDelete={() => this.props.setPostData({ vote: {} })} onClick={() => {
              this.props.handleAttachClick({
                type: THREAD_TYPE.vote,
              });
            }} />
          )}

          {/* 商品组件 */}
          {postData.product && postData.product.readyContent && (
            <Product
              good={postData.product}
              onDelete={() => this.props.setPostData({ product: {} })}
            />
          )}
          <DZQPluginCenterInjectionPolyfill
            target='plugin_post'
            hookName='post_extension_content_hook'
            pluginProps={{
              renderData: postData.plugin,
              deletePlugin: this.props.threadPost.deletePluginPostData,
              updatePlugin: this.props.threadPost.setPluginPostData,
            }}/>
        </div>
        <div id="post-bottombar" className={styles['post-bottombar']}>
          {threadPost.isHaveLocalData && (<div id="post-localdata" className={styles['post-localdata']}>
            <TagLocalData />
          </div>)}
          {/* 插入位置和自动保存 */}
          {((permissions?.insertPosition?.enable && webConfig?.lbs?.lbs) || postData.autoSaveTime) && (
            <div id="post-position" className={styles['position-box']}>
              {/* 插入位置 */}
              {(permissions?.insertPosition?.enable && webConfig?.lbs?.lbs) && (<Position
                lbskey={webConfig.lbs.qqLbsKey}
                position={postData.position}
                onChange={position => this.props.setPostData({ position })} />)}
              {/* 自动保存提示 */}
              {postData.autoSaveTime && (<div className={styles['post-autosave']}>最近保存{postData.autoSaveTime}</div>)}
            </div>
          )}
          {((postData.rewardQa.value && postData.rewardQa.times)
            || postData.redpacket.price
            || !!(postData.price || postData.attachmentPrice)
          ) && (
            <MoneyDisplay
              canEditReward={this.props.canEditReward}
              canEditRedpacket={this.props.canEditRedpacket}
              payTotalMoney={threadPost.payTotalMoney}
              redTotalMoney={threadPost.redpacketTotalAmount}
              postData={postData}
              setPostData={(data) => {
                this.props.setPostData(data);
                this.clearBottomFixed();
              }}
              handleSetState={(data) => {
                this.props.handleSetState(data);
              }}
              onAttachClick={(item, data) => {
                this.props.handleAttachClick(item, data);
                this.clearBottomFixed();
              }}
              onDefaultClick={(item, child, data) => {
                this.props.handleDefaultIconClick(item, child, data);
                this.clearBottomFixed();
              }}
            />
          )}
          {/* 调整了一下结构，因为这里的工具栏需要固定 */}
		  {  webConfig.setSite.siteFabu === 1 && (
		    <>
			  <AttachmentToolbar
				site={this.props.site}
				threadPost={this.props.threadPost}
				isOpenQcloudVod={this.props.site.isOpenQcloudVod}
				onPluginSetPostData={this.props.threadPost.setPluginPostData}
				postData={postData}
				onAttachClick={this.props.handleAttachClick}
				// onUploadChange={this.handleUploadChange}
				onVideoUpload={this.props.handleVideoUpload}
				onUploadComplete={this.props.handleVideoUploadComplete}
				category={
				  <ToolsCategory
					categoryChoose={threadPost.categorySelected}
					onClick={this.handleCategoryClick} />}
				permission={threadExtendPermissions}
				currentSelectedToolbar={threadPost.currentSelectedToolbar}
			  />
			  {/* 默认的操作栏 */}
			  <DefaultToolbar
				postData={postData}
				value={currentDefaultOperation}
				onClick={(item) => {
				  this.props.handleDefaultIconClick(item);
				  if (item.type === defaultOperation.emoji) this.setPostBox();
				  else this.clearBottomFixed();
				}}
				permission={threadExtendPermissions}
				onSubmit={this.props.handleSubmit}>
			  </DefaultToolbar>
			</>
		  )}
		  
		  {/* 第二种展示方式：调整了一下结构，因为这里的工具栏需要固定 */}
		  {  webConfig.setSite.siteFabu === 2 && (
		    <>
			  <AttachmentToolbarer
				site={this.props.site}
				threadPost={this.props.threadPost}
				isOpenQcloudVod={this.props.site.isOpenQcloudVod}
				onPluginSetPostData={this.props.threadPost.setPluginPostData}
				postData={postData}
				onAttachClick={this.props.handleAttachClick}
				// onUploadChange={this.handleUploadChange}
				onVideoUpload={this.props.handleVideoUpload}
				onUploadComplete={this.props.handleVideoUploadComplete}
				category={
				  <ToolsCategory
					categoryChoose={threadPost.categorySelected}
					onClick={this.handleCategoryClick} />}
				permission={threadExtendPermissions}
				currentSelectedToolbar={threadPost.currentSelectedToolbar}
			  />
			  {/* 第二种展示方式：默认的操作栏 */}
			  <DefaultToolbar
				postData={postData}
				value={currentDefaultOperation}
				onClick={(item) => {
				  this.props.handleDefaultIconClick(item);
				  if (item.type === defaultOperation.emoji) this.setPostBox();
				  else this.clearBottomFixed();
				}}
				permission={threadExtendPermissions}
				onSubmit={this.props.handleSubmit}>
			  </DefaultToolbar>
		    </>
		  )}
		  {/* 第三种展示方式：调整了一下结构，因为这里的工具栏需要固定 */}
		  {  webConfig.setSite.siteFabu === 3 && (
		    <>
			  {/* 第三种展示方式：默认的操作栏 */}
			  
			  {/*<DefaultToolbarsan
				postData={postData}
				value={currentDefaultOperation}
				onClick={(item) => {
				  this.props.handleDefaultIconClick(item);
				  if (item.type === defaultOperation.emoji) this.setPostBox();
				  else this.clearBottomFixed();
				}}
				permission={threadExtendPermissions}
				onSubmit={this.props.handleSubmit}>
			  </DefaultToolbarsan>*/}
			  <AttachmentToolbarsan
				site={this.props.site}
				threadPost={this.props.threadPost}
				isOpenQcloudVod={this.props.site.isOpenQcloudVod}
				onPluginSetPostData={this.props.threadPost.setPluginPostData}
				postData={postData}
				onAttachClick={this.props.handleAttachClick}
				// onUploadChange={this.handleUploadChange}
				onVideoUpload={this.props.handleVideoUpload}
				onUploadComplete={this.props.handleVideoUploadComplete}
				onSubmit={this.props.handleSubmit}
				onClick={(item) => {
				  this.props.handleDefaultIconClick(item);
				  if (item.type === defaultOperation.emoji) this.setPostBox();
				  else this.clearBottomFixed();
				}}
				category={
				  <ToolsCategory
					categoryChoose={threadPost.categorySelected}
					onClick={this.handleCategoryClick} />}
				permission={threadExtendPermissions}
				currentSelectedToolbar={threadPost.currentSelectedToolbar}
			  />
		    </>
		  )}
		  {/* 第四种展示方式：调整了一下结构，因为这里的工具栏需要固定 */}
		  {  webConfig.setSite.siteFabu === 4 && (
		    <>
		  			  {/* 第四种展示方式：默认的操作栏 */}
		  			  
		  			  {/*<DefaultToolbarsan
		  				postData={postData}
		  				value={currentDefaultOperation}
		  				onClick={(item) => {
		  				  this.props.handleDefaultIconClick(item);
		  				  if (item.type === defaultOperation.emoji) this.setPostBox();
		  				  else this.clearBottomFixed();
		  				}}
		  				permission={threadExtendPermissions}
		  				onSubmit={this.props.handleSubmit}>
		  			  </DefaultToolbarsan>*/}
			  <AttachmentToolbarsi
				site={this.props.site}
				threadPost={this.props.threadPost}
				isOpenQcloudVod={this.props.site.isOpenQcloudVod}
				onPluginSetPostData={this.props.threadPost.setPluginPostData}
				postData={postData}
				onAttachClick={this.props.handleAttachClick}
				// onUploadChange={this.handleUploadChange}
				onVideoUpload={this.props.handleVideoUpload}
				onUploadComplete={this.props.handleVideoUploadComplete}
				onSubmit={this.props.handleSubmit}
				onClick={(item) => {
				  this.props.handleDefaultIconClick(item);
				  if (item.type === defaultOperation.emoji) this.setPostBox();
				  else this.clearBottomFixed();
				}}
				category={
				  <ToolsCategory
					categoryChoose={threadPost.categorySelected}
					onClick={this.handleCategoryClick} />}
				    permission={threadExtendPermissions}
				    currentSelectedToolbar={threadPost.currentSelectedToolbar}
			    />
		    </>
		  )}
            {/* 表情 */}
          <Emoji
            show={currentDefaultOperation === defaultOperation.emoji}
            emojis={threadPost.emojis}
            onClick={
              (emoji) => {
                this.props.handleEmojiClick(emoji);
              }}
            />
        </div>
        {/* 选择帖子类别 */}
        <ClassifyPopup
          show={categoryChooseShow}
          categoryId={threadPost.postData.categoryId}
          onVisibleChange={val => this.props.handleSetState({ categoryChooseShow: val })}
        />
        {/* 插入 at 关注的人 */}
        {currentDefaultOperation === defaultOperation.at && (
          <AtSelect
            visible={currentDefaultOperation === defaultOperation.at}
            getAtList={this.props.handleAtListChange}
            onCancel={() => this.props.handleSetState({ currentDefaultOperation: '' })}
          />
        )}
        {/* 插入选中的话题 */}
        {currentDefaultOperation === defaultOperation.topic && (
          <TopicSelect
            visible={currentDefaultOperation === defaultOperation.topic}
            cancelTopic={() => this.props.handleSetState({ currentDefaultOperation: '' })}
            clickTopic={val => this.props.handleSetState({ topic: val })}
          />
        )}
        {/* 付费选择 */}
        {currentDefaultOperation === defaultOperation.pay && (
          <PostPopup
            list={this.props.paySelectText}
            onClick={(val) => {
              const content = '全帖付费和部分付费不能同时设置';
              if (postData.price && val === '部分付费') {
                Toast.error({ content });
                return false;
              }
              if (postData.attachmentPrice && val === '全帖付费') {
                Toast.error({ content });
                return false;
              }
              this.props.handleSetState({ curPaySelect: val });
            }}
            cancel={() => this.props.handleSetState({ currentDefaultOperation: '' })}
            visible={currentDefaultOperation === defaultOperation.pay}
          />
        )}
        {/* 是否保存草稿 */}
        {this.props.draftShow && (
          <PostPopup
            list={['保存草稿', '不保存草稿']}
            onClick={val => this.props.handleDraft(val)}
            cancel={() => this.props.handleDraft()}
            visible={this.props.draftShow}
          />
        )}
        {/* 悬赏问答 */}
        {currentAttachOperation === THREAD_TYPE.reward && (
          <RewardQa
            confirm={(data) => {
              this.props.setPostData({ rewardQa: data });
              this.props.handleSetState({ currentAttachOperation: false });
              this.clearBottomFixed();
            }}
            cancel={() => {
              this.props.handleSetState({
                currentAttachOperation: false,
              });
            }}
            data={postData.rewardQa}
          />
        )}

        {/* 投票编辑 */}
        {currentAttachOperation === THREAD_TYPE.vote && (
          <VoteEditor
            visible={currentAttachOperation === THREAD_TYPE.vote}
            cancel={() => {
              this.props.handleSetState({ currentAttachOperation: false });
              this.props.threadPost.setCurrentSelectedToolbar(false);
              // 位置重新计算
              this.handler();
            }}
          />
        )}

        {/* 插入红包 */}
        {currentDefaultOperation === defaultOperation.redpacket && (
          <RedpacketSelect
            data={postData.redpacket}
            cancel={() => this.props.handleSetState({ currentDefaultOperation: '' })}
            confirm={(data) => {
              this.props.setPostData({ redpacket: data });
              this.clearBottomFixed();
            }}
          />
        )}
        {/* 插入商品 */}
        {currentAttachOperation === THREAD_TYPE.goods && (
          <ProductSelect onAnalyseSuccess={
            (data) => {
              this.props.handleSetState({ currentAttachOperation: false });
              this.props.setPostData({ product: data });
              this.clearBottomFixed();
            }}
            cancel={() => this.props.handleSetState({ currentAttachOperation: false })}
          />
        )}
        {/* 付费设置 */}
        {this.props.curPaySelect && (
          <Payment
            paidType={this.props.curPaySelect}
            cancel={() => {
              this.props.handleSetState({ curPaySelect: '', currentDefaultOperation: '' });
              this.clearBottomFixed();
            }}
          />
        )}
        {/* 插入视频或者外部音视频iframe链接 */}
        {currentAttachOperation === THREAD_TYPE.video && (
          <IframeVideo
            visible={currentAttachOperation === THREAD_TYPE.video}
            onCancel={() => {
              this.props.handleSetState({ currentAttachOperation: false });
              this.props.threadPost.setCurrentSelectedToolbar(false);
            }}
            beforeUpload={this.props.handleVideoUpload}
            onUploadChange={(files) => {
              this.props.handleSetState({ currentAttachOperation: false });
              this.props.threadPost.setCurrentSelectedToolbar(false);
              this.props.handleVideoUpload(files);
            }}
          />
        )}
      </div>
    );
  }
}

export default withRouter(ThreadCreate);
