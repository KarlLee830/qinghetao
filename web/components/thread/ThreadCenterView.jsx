import React, { useMemo, useCallback } from 'react';
import { Button, Icon } from '@discuzqsdk/design';
import AudioPlay from './audio-play';
import PostContent from './post-content';
import ProductItem from './product-item';
import VideoPlay from './video-play';
import { handleAttachmentData } from './utils';
import AttachmentView from './attachment-view';
import ImageDisplay from './image-display';
import VoteDisplay from './vote-display';
import IframeVideoDisplay from '@components/thread-post/iframe-video-display';
import Packet from './packet';
import styles from './index.module.scss';
import SiteMapLink from '@components/site-map-link';
import DZQPluginCenterInjectionPolyfill from '../../utils/DZQPluginCenterInjectionPolyfill';

// 插件引入
/**DZQ->plugin->register<plugin_index@thread_extension_display_hook>**/

/**
 * 帖子内容组件
 * @prop {object} data 帖子数据
 * @prop {function} onClick 点赞文字内容触发
 * @prop {function} onPay 点击付费按钮触发
 */

const Index = (props) => {
  const {
    title = '',
    payType,
    price,
    paid,
    attachmentPrice,
    openedMore,
  } = props.data || {};
  const needPay = useMemo(() => payType !== 0 && !paid, [paid, payType]); // 付费贴需要付费

  const {
    threadId,
    onClick,
    unifyOnClick = null,
    onPay,
    onOpen,
    onClose,
    platform,
    updateViewCount,
    onTextItemClick,
	site
  } = props;

  const {
    canDownloadAttachment,
    canViewAttachment,
    canViewVideo
  } = props?.data?.ability || {};

  // 标题显示37个字符
  const newTitle = useMemo(() => {
    if (title.length > 100) {
      return `${title.slice(0, 100)}...`;
    }
    return title;
  }, [title]);

  // 帖子属性内容
  const renderThreadContent = ({ content: data, attachmentPrice, payType, paid, site } = {}) => {
    const {
      text,
      imageData,
      audioData,
      videoData,
      goodsData,
      redPacketData,
      rewardData,
      fileData,
      voteData,
      threadId,
      iframeData,
      plugin
    } = handleAttachmentData(data);
	//const { site } = this.props;

    return (
      <>
        {text && <PostContent
          onContentHeightChange={props.onContentHeightChange}
          content={text}
          updateViewCount={updateViewCount}
          useShowMore={!openedMore}
          needShowMore={true}
          onRedirectToDetail={onClick}
          onOpen={onOpen}
          onClose={onClose}
          onTextItemClick={onTextItemClick} />
        }

        {videoData && videoData.needPay !== 1 && (
          <WrapperView onClick={onClick}>
            <VideoPlay
              url={videoData.mediaUrl}
              coverUrl={videoData.coverUrl}
              v_width={videoData.width || null}
              v_height={videoData.height || null}
              status={videoData.status}
              onVideoReady={props.onVideoReady}
              updateViewCount={updateViewCount}
              canViewVideo={canViewVideo}
            />
          </WrapperView>

        )}
        {/* 外部视频iframe插入和上面的视频组件是互斥的 */}
        {(iframeData && iframeData.content) && (
          <IframeVideoDisplay
            content={iframeData.content}
          />
        )}
        {imageData?.length > 0 && (
          <ImageDisplay
            platform={props.platform}
            imgData={imageData}
            isPay={needPay}
            onPay={onPay}
            onClickMore={onClick}
            onImageReady={props.onImageReady}
            updateViewCount={updateViewCount}
          />
        )
        }
        {rewardData && <Packet
          type={1}
          // money={rewardData.money}
          onClick={onClick}
        />}
        {redPacketData && <Packet
          // money={redPacketData.money || 0}
          onClick={onClick}
          condition={redPacketData.condition}
        />}
        {goodsData && <ProductItem
          image={goodsData.imagePath}
          amount={goodsData.price}
          title={goodsData.title}
          onClick={onClick}
        />}
        {audioData && <AudioPlay url={audioData.mediaUrl} isPay={needPay} onPay={onPay} updateViewCount={updateViewCount} />}
        {fileData?.length > 0 && <AttachmentView
          unifyOnClick={unifyOnClick}
          threadId={threadId}
          attachments={fileData}
          onPay={onPay}
          isPay={needPay}
          updateViewCount={updateViewCount}
          canViewAttachment={canViewAttachment}
          canDownloadAttachment={canDownloadAttachment}
        />}
        {/* 投票帖子展示 */}
        {voteData && <VoteDisplay recomputeRowHeights={props.recomputeRowHeights} voteData={voteData} threadId={threadId} />}
        <DZQPluginCenterInjectionPolyfill
          target='plugin_index'
          hookName='thread_extension_display_hook'
          pluginProps={{
            renderData: plugin,
            threadData: props.data,
            updateListThreadIndexes: props.updateListThreadIndexes,
            updateThread: props.updateThread,
            recomputeRowHeights: props.recomputeRowHeights
        }}/>

      </>
    );
  };
  //const { site } = this.props;
  return (
    <>
      <SiteMapLink href={`/thread/${threadId}`} text={newTitle && newTitle !== '' ? newTitle : props.data?.content?.text}/>
      <div className={`${platform === 'h5' ? styles.wrapper : styles.wrapperPC}`}>
        {title && <h1 className={styles.title} onClick={onClick}>{newTitle}</h1>}
          {renderThreadContent(props.data)}
      </div>
      {
        needPay && (
		  <>
		    {site.webConfig.setSite.sitePay[0].value && (
			  <div className={styles.pay}>
				<Button className={styles.button} type="primary" onClick={onPay}>
				  <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
				  {payType === 1 ? <p className={styles.payText}>{`支付${price}元查看剩余内容`}</p> : <p className={styles.payText}>{`支付${attachmentPrice}元查看付费内容`}</p>}
				</Button>
			  </div>
			)}
		  </>

        )
      }
    </>
  );
};

export default React.memo(Index);

// 处理
const WrapperView = ({ children, onClick }) => (
  <div className={styles.wrapperView}>
    {children}
    <div className={styles.placeholder} onClick={onClick}></div>
  </div>
);
