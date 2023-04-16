/* eslint-disable spaced-comment */
import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import Header from '@components/header';
import DVditor from '@components/editor';
import Title from '@components/thread-post/title';
import { AttachmentToolbar, DefaultToolbar } from '@components/editor/toolbar';
import Position from '@components/thread-post/position';
import { Button, Audio, AudioRecord } from '@discuzqsdk/design';
import ClassifyPopup from '@components/thread-post/classify-popup';
import { withRouter } from 'next/router';
import Emoji from '@components/editor/emoji';
import ImageUpload from '@components/thread-post/image-upload';
import { defaultOperation } from '@common/constants/const';
import FileUpload from '@components/thread-post/file-upload';
import { THREAD_TYPE } from '@common/constants/thread-post';
import Product from '@components/thread-post/product';
import ProductSelect from '@components/thread-post/product-select';
import VoteEditor from '@components/thread-post/vote-editor';
import Payment from '@components/thread-post/payment';
import AtSelect from '@components/thread-post/at-select';
import TopicSelect from '@components/thread-post/topic-select';
import RedpacketSelect from '@components/thread-post/redpacket-select';
import Copyright from '@components/copyright';
import RewardQa from '@components/thread-post/reward-qa';
import VideoDisplay from '@components/thread-post/video-display';
import MoneyDisplay from '@components/thread-post/money-display';
import TagLocalData from '@components/thread-post/tag-localdata';
import VoteWidget from '@components/thread-post/vote-widget';
import IframeVideo from '@components/thread-post/iframe-video';
import IframeVideoDisplay from '@components/thread-post/iframe-video-display';
import DZQPluginCenterInjectionPolyfill from '../../../../utils/DZQPluginCenterInjectionPolyfill';

// 插件引入
/**DZQ->plugin->register<plugin_post@post_extension_content_hook>**/

@inject('threadPost')
@inject('index')
@inject('thread')
@inject('user')
@inject('site')
@observer
class ThreadPCPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editorTopicShow: false,
      editorAtShow: false,
      topicStyle: {},
      atStyle: {},
      lastindex: -1,
      vditor: null,
    };

    this.pluginContainer = React.createRef();
  }

  componentDidMount() {
    // 监听插件区域的高度变化调整编辑器的min-height style，使编辑器初始化时占满编辑框，更容易监测到图片拖拽上传
    const resizeObserver = new ResizeObserver(() => {
      const el = this.pluginContainer.current;
      const vditorContent = document.querySelector('#dzq-vditor');
      if (!vditorContent) return;
      if (el && el.offsetHeight) {
        vditorContent.style.minHeight = '44px';
      } else {
        vditorContent.style.minHeight = '450px';
      }
    });

    resizeObserver.observe(this.pluginContainer.current);

  }

  hintCustom = (type, key, textareaPosition, lastindex, vditor) => {
    this.hintHide();
    if (type === '#') {
      this.setState({ editorTopicShow: true, topicStyle: textareaPosition, lastindex, vditor });
    }
    if (type === '@') {
      this.setState({ editorAtShow: true, atStyle: textareaPosition, lastindex, vditor });
    }
  };

  hintHide = () => {
    this.setState({ editorTopicShow: false, editorAtShow: false });
  };

  setEditorRange = () => {
    const { range } = this.state.vditor[this.state.vditor.currentMode];
    if (range) {
      range.setStart(range.startContainer, this.state.lastindex);
      range.deleteContents();
      range.collapse(false);
      this.setSelectionFocus(range);
    }
  };

  setSelectionFocus = (range) => {
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  render() {
    const {
      threadPost,
      user,
      site,
      emoji,
      topic,
      atList,
      currentDefaultOperation,
      currentAttachOperation,
    } = this.props;
    const { postData } = threadPost;
    const { webConfig = {}, attachmentLimit = 9 } = site;
    const { setAttach, qcloud } = webConfig;
    const { supportImgExt, supportMaxSize } = setAttach;
    const { qcloudCosBucketName, qcloudCosBucketArea, qcloudCosSignUrl, qcloudCos } = qcloud;
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.wrapper}>
          <div className={styles['wrapper-inner']}>
            { webConfig.setSite.siteTitles === 1 && (
			  <Title pc
			    title={postData.title}
			    isDisplay={true}
			    onChange={title => this.props.setPostData({ title })}
			  />
			)}
            <div className={styles.editor} onClick={this.props.handleVditorFocus}>
              <div className={styles['editor-inner']} id="post-inner" onScroll={() => {
                this.hintHide();
              }}>
                <DVditor
                  pc
                  value={postData.contentText}
                  isResetContentText={postData.isResetContentText}
                  emoji={emoji}
                  atList={atList}
                  topic={topic}
                  onChange={this.props.handleVditorChange}
                  onCountChange={count => this.props.handleSetState({ count })}
                  onFocus={() => { }}
                  onBlur={() => { }}
                  onInit={this.props.handleVditorInit}
                  setState={this.props.handleSetState}
                  hintCustom={(type, key, textareaPosition, lastindex, vditor) => this.hintCustom(type, key, textareaPosition, lastindex, vditor)}
                  hintHide={this.hintHide}
                />

                <div ref={this.pluginContainer}>
                  {this.state.editorTopicShow
                    && <TopicSelect
                      pc
                      visible={this.state.editorTopicShow}
                      style={this.state.topicStyle}
                      cancelTopic={this.hintHide}
                      clickTopic={(val) => {
                        this.setEditorRange();
                        this.props.handleSetState({ topic: val });
                      }}
                    />
                  }
                  {this.state.editorAtShow
                    && <AtSelect
                      pc
                      style={this.state.atStyle}
                      visible={this.state.editorAtShow}
                      getAtList={(list) => {
                        this.setEditorRange();
                        this.props.handleAtListChange(list);
                      }}
                      onCancel={this.hintHide}
                    />
                  }


                  {/* 插入图片 */}
                  {(currentAttachOperation === THREAD_TYPE.image
                    || Object.keys(postData.images).length > 0) && (
                    <ImageUpload
                      cosOptions={{
                        supportImgExt,
                        supportMaxSize,
                        qcloudCosBucketName,
                        qcloudCosBucketArea,
                        qcloudCosSignUrl,
                        qcloudCos,
                      }}
                      className={styles['no-padding']}
                      fileList={Object.values(postData.images)}
                      onChange={fileList => this.props.handleUploadChange(fileList, THREAD_TYPE.image)}
                      onComplete={(ret, file) => this.props.handleUploadComplete(ret, file, THREAD_TYPE.image)}
                      beforeUpload = {(cloneList, showFileList) => this.props.beforeUpload(cloneList, showFileList, THREAD_TYPE.image)}
                    />
                  )}

                  {/* 视频组件 */}
                  {(postData.video && postData.video.thumbUrl) && (
                    <VideoDisplay
                      pc
                      src={postData.video.thumbUrl}
                      onDelete={() => this.props.setPostData({ video: {} })}
                      onReady={this.props.onVideoReady} />
                  )}

                  {/* 外部视频iframe插入和上面的视频组件是互斥的 */}
                  {(postData.iframe && postData.iframe.content) && (
                    <IframeVideoDisplay
                      content={postData.iframe.content}
                      isDeleteShow
                    />
                  )}
                  {/* 录音组件 */}
                  {(currentAttachOperation === THREAD_TYPE.voice) && (
                    <div id="dzq-post-audio-record">
                      <AudioRecord duration={60}
                        onUpload={(blob) => {
                          this.props.handleAudioUpload(blob);
                        }}
                      />
                    </div>
                  )}
                  {/* 语音组件 */}
                  {(Boolean(postData.audio.mediaUrl))
                    && (<Audio src={postData.audio.mediaUrl} />)}

                  {/* 附件上传组件 */}
                  {(currentDefaultOperation === defaultOperation.attach || Object.keys(postData.files).length > 0) && (
                    <FileUpload
                      limit={attachmentLimit}
                      cosOptions={{
                        supportImgExt,
                        supportMaxSize,
                        qcloudCosBucketName,
                        qcloudCosBucketArea,
                        qcloudCosSignUrl,
                        qcloudCos,
                      }}
                      className={styles['no-padding']}
                      fileList={Object.values(postData.files)}
                      onChange={fileList => this.props.handleUploadChange(fileList, THREAD_TYPE.file)}
                      onComplete={(ret, file) => this.props.handleUploadComplete(ret, file, THREAD_TYPE.file)}
                      beforeUpload = {(cloneList, showFileList) => this.props.beforeUpload(cloneList, showFileList, THREAD_TYPE.file)}
                    />
                  )}

                  {/* 投票组件 */}
                  {(postData?.vote?.voteTitle) && (
                    <VoteWidget isPc={true} onDelete={() => this.props.setPostData({ vote: {} })} onClick={() => {
                      this.props.handleAttachClick({
                        type: THREAD_TYPE.vote,
                      });
                    }} />
                  )}

                  {/* 商品组件 */}
                  {postData.product && postData.product.readyContent && (
                    <Product
                      pc
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
                      updatePlugin: this.props.threadPost.setPluginPostData
                  }}/>

                </div>

              </div>
              {/* 设置的金额相关展示 + 本地缓存设置 */}
              <div className={styles['editor-footer']}>
                <div className={styles['editor-footer--left']}>
                  {threadPost.isHaveLocalData && <TagLocalData pc />}
                  <MoneyDisplay
                    pc
                    canEditReward={this.props.canEditReward}
                    canEditRedpacket={this.props.canEditRedpacket}
                    payTotalMoney={threadPost.payTotalMoney}
                    redTotalMoney={threadPost.redpacketTotalAmount}
                    postData={postData} setPostData={this.props.setPostData}
                    handleSetState={this.props.handleSetState}
                    onAttachClick={this.props.handleAttachClick}
                    onDefaultClick={this.props.handleDefaultIconClick}
                  />
                </div>
                {postData.autoSaveTime && (<div className={styles['editor-footer--right']}>
                  最近保存{postData.autoSaveTime}
                </div>)}
              </div>
            </div>
            <div className={styles.toolbar}>
              <div className={styles['toolbar-left']}>
                <DefaultToolbar
                  pc
                  postData={postData}
                  permission={user.threadExtendPermissions}
                  value={currentDefaultOperation}
                  onClick={(item, child) => {
                    this.hintHide();
                    this.props.handleDefaultIconClick(item, child);
                  }}
                  onSubmit={this.props.handleSubmit}>
                  {/* 表情 */}
                  <Emoji
                    pc
                    show={currentDefaultOperation === defaultOperation.emoji}
                    emojis={threadPost.emojis}
                    onClick={this.props.handleEmojiClick} />
                  {/* 插入选中的话题 */}
                  {currentDefaultOperation === defaultOperation.topic && (
                    <TopicSelect
                      pc
                      visible={currentDefaultOperation === defaultOperation.topic}
                      cancelTopic={() => this.props.handleSetState({ currentDefaultOperation: '' })}
                      clickTopic={val => this.props.handleSetState({ topic: val })}
                    />
                  )}
                  {/* 插入 at 关注的人 */}
                  {currentDefaultOperation === defaultOperation.at && (
                    <AtSelect
                      pc
                      visible={currentDefaultOperation === defaultOperation.at}
                      getAtList={list => this.props.handleAtListChange(list)}
                      onCancel={() => this.props.handleSetState({ currentDefaultOperation: '' })}
                    />
                  )}
                </DefaultToolbar>
                <div className={styles.divider}></div>
                <AttachmentToolbar
                  pc
                  isOpenQcloudVod={this.props.site.isOpenQcloudVod}
                  site={this.props.site}
                  threadPost={this.props.threadPost}
                  postData={postData}
                  onAttachClick={(item, ...props) => {
                    this.hintHide();
                    this.props.handleAttachClick(item, ...props);
                  }}
                  onPluginSetPostData={this.props.threadPost.setPluginPostData}
                  onVideoUpload={this.props.handleVideoUpload}
                  onUploadComplete={this.props.handleVideoUploadComplete}
                  permission={user.threadExtendPermissions}
                  currentSelectedToolbar={threadPost.currentSelectedToolbar}
                />
              </div>
              <div className={styles['toolbar-right']}>
                {(user?.permissions?.insertPosition?.enable && webConfig?.lbs?.lbs) && (
                  <Position
                    lbskey={webConfig.lbs.qqLbsKey}
                    position={postData.position}
                    onChange={position => this.props.setPostData({ position })}
                  />
                )}
              </div>
            </div>
            <ClassifyPopup pc onClick={this.hintHide} categoryId={threadPost.postData.categoryId} />
            <div className={styles.footer}>
              <Button type="info" disabled={this.props.postType === 'isEdit' && !postData.isDraft}
                onClick={() => this.props.handleDraft()}>保存至草稿箱</Button>
              <Button type="primary" onClick={() => this.props.handleSubmit()}>发布</Button>
            </div>
          </div>
          <Copyright center />
          {/* 插入商品 */}
          {currentAttachOperation === THREAD_TYPE.goods && (
            <ProductSelect
              pc
              visible={currentAttachOperation === THREAD_TYPE.goods}
              onAnalyseSuccess={
                (data) => {
                  this.props.handleSetState({ currentAttachOperation: false });
                  this.props.setPostData({ product: data });
                }
              }
              cancel={() => {
                this.props.handleSetState({ currentAttachOperation: false });
                this.props.threadPost.setCurrentSelectedToolbar(false);
              }}
            />
          )}
          {/* 插入投票 - 弹框 */}
          {currentAttachOperation === THREAD_TYPE.vote && (
            <VoteEditor
              pc
              visible={currentAttachOperation === THREAD_TYPE.vote}
              cancel={() => {
                this.props.handleSetState({ currentAttachOperation: false });
                this.props.threadPost.setCurrentSelectedToolbar(false);
              }}
            />
          )}
          {/* 插入视频或者外部音视频iframe链接 */}
          {currentAttachOperation === THREAD_TYPE.video && (
            <IframeVideo pc
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
          {/* 插入付费 */}
          {!!this.props.curPaySelect && (
            <Payment
              pc
              visible={!!this.props.curPaySelect}
              paidType={this.props.curPaySelect}
              cancel={() => {
                this.props.handleSetState({ curPaySelect: '', currentDefaultOperation: '' });
              }}
            />
          )}
          {/* 插入红包 */}
          {currentDefaultOperation === defaultOperation.redpacket && (
            <RedpacketSelect
              pc
              visible={currentDefaultOperation === defaultOperation.redpacket}
              data={postData.redpacket}
              cancel={() => this.props.handleSetState({ currentDefaultOperation: '' })}
              confirm={data => this.props.setPostData({ redpacket: data })}
            />
          )}
          {currentAttachOperation === THREAD_TYPE.reward && (
            <RewardQa
              pc
              visible={currentAttachOperation === THREAD_TYPE.reward}
              confirm={(data) => {
                this.props.setPostData({ rewardQa: data });
                this.props.handleSetState({ currentAttachOperation: false });
              }}
              cancel={() => {
                this.props.handleSetState({
                  currentAttachOperation: false,
                });
                this.props.threadPost.setCurrentSelectedToolbar(false);
              }}
              data={postData.rewardQa}
            />
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(ThreadPCPage);
