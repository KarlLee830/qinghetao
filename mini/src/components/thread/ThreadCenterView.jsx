import React, { useMemo, useRef, useEffect, useState } from 'react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import RichText from '@discuzqsdk/design/dist/components/rich-text/index';
import AudioPlay from './audio-play';
import PostContent from './post-content';
import ProductItem from './product-item';
import VideoPlay from './video-play';
import VoteDisplay from './vote-display';
import { handleAttachmentData } from './utils';
import AttachmentView from './attachment-view';
import ImageDisplay from './image-display';
import Packet from './packet';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import { getElementRect, randomStr, noop, handleLink } from './utils'
import DZQPluginCenterInjection from '@discuzqsdk/plugin-center/dist/components/DZQPluginCenterInjection';

// 插件引入
/**DZQ->plugin->register<plugin_index@thread_extension_display_hook>**/

/**
 * 帖子内容组件
 * @prop {object} data 帖子数据
 * @prop {function} onClick 点赞文字内容触发
 * @prop {function} onPay 点击付费按钮触发
 */

const Index = (props) => {
  const { title = '', payType, price, paid, attachmentPrice } = props.data || {};

  const needPay = useMemo(() => payType !== 0 && !paid, [paid, payType]);
  const {
    onClick,
    onPay,
    relativeToViewport = true,
    changeHeight = noop,
    useShowMore = true,
    setUseShowMore = noop,
    setUseCloseMore = noop,
    updateViewCount = noop,
    onTextItemClick,
    site,
    unifyOnClick = null,
  } = props;

  const {
    canDownloadAttachment,
    canViewAttachment,
    canViewVideo
  } = props?.data?.ability || {};

  const wrapperId = useRef(`thread-wrapper-${randomStr()}`)

  // 标题显示37个字符
  const newTitle = useMemo(() => {
    if (title.length > 100) {
      return `${title.slice(0, 100)}...`;
    }
    return title;
  }, [title]);

  // 帖子属性内容
  const renderThreadContent = ({ content: data } = {}, videoH = 0) => {
    const {
      text,
      imageData,
      audioData,
      videoData,
      goodsData,
      redPacketData,
      rewardData,
      voteData,
      fileData,
      threadId,
      iframeData,
      plugin
    } = handleAttachmentData(data);
    return (
      <>
        {text && (
          <PostContent
            content={text}
            updateViewCount={updateViewCount}
            onRedirectToDetail={onClick}
            relativeToViewport={relativeToViewport}
            changeHeight={changeHeight}
            useShowMore={useShowMore}
            setUseCloseMore={setUseCloseMore}
            setUseShowMore={setUseShowMore}
            onTextItemClick={onTextItemClick}
          />
        )}
        {videoData && videoData.needPay !== 1 && (
          <WrapperView onClick={onClick} videoH={videoH}>
            <VideoPlay
              url={videoData.mediaUrl}
              coverUrl={videoData.coverUrl}
              v_width={videoData.width || null}
              v_height={videoData.height || null}
              status={videoData.status}
              relativeToViewport={relativeToViewport}
              changeHeight={changeHeight}
              updateViewCount={updateViewCount}
              canViewVideo={canViewVideo}
            />
          </WrapperView>
        )}
        {/* 外部视频iframe插入和上面的视频组件是互斥的 */}
        {(iframeData && iframeData.content) && (
          <RichText
            className={styles.richtext}
            content={iframeData.content}
            iframeWhiteList={['bilibili', 'youku', 'iqiyi', 'music.163.com', 'qq.com', 'em.iq.com', 'xigua']}
            onClick={() => { }}
            onImgClick={() => { }}
            onLinkClick={(node) => {
              handleLink(node);
            }}
            transformer={parseDom => parseDom}
          />
        )}
        {imageData?.length ? (
          <ImageDisplay
            platform="h5"
            imgData={imageData}
            isPay={needPay}
            onPay={onPay}
            onClickMore={onClick}
            relativeToViewport={relativeToViewport}
            updateViewCount={updateViewCount}
          />
        ) : null}
        {rewardData && (
          <Packet
            type={1}
            // money={rewardData.money}
            onClick={onClick} />
        )}
        {redPacketData && (
          <Packet
            // money={redPacketData.money || 0}
            onClick={onClick}
            condition={redPacketData.condition}
          />
        )}
        {goodsData && (
          <ProductItem
            image={goodsData.imagePath}
            amount={goodsData.price}
            title={goodsData.title}
            onClick={onClick}
          />
        )}
        {audioData && <AudioPlay url={audioData.mediaUrl} isPay={needPay} onPay={onPay} updateViewCount={updateViewCount} />}
        {fileData?.length ? <AttachmentView
          threadId={threadId}
          unifyOnClick={unifyOnClick}
          attachments={fileData}
          onPay={onPay}
          isPay={needPay}
          updateViewCount={updateViewCount}
          canViewAttachment={canViewAttachment}
          canDownloadAttachment={canDownloadAttachment}
        />
          : null
        }

        {/* 投票帖子展示 */}
        {voteData && <VoteDisplay voteData={voteData} updateViewCount={props.updateViewCount} threadId={threadId} />}
        <DZQPluginCenterInjection
          target='plugin_index'
          hookName='thread_extension_display_hook'
          pluginProps={{
            renderData: plugin,
            threadData: props.data,
            updateListThreadIndexes: props.updateListThreadIndexes,
            updateThread: props.updateThread,
            recomputeRowHeights: props.recomputeRowHeights
          }}
        />
      </>
    );
  };
  return (
    <>
      <View id={wrapperId.current} className={styles.wrapper}>
        {title && (
          <View className={styles.title} onClick={onClick}>
            {newTitle}
          </View>
        )}

        {renderThreadContent(props.data, props.videoH)}
      </View>

      {site.webConfig.setSite.sitePay[2].value && (
      	<>
          {needPay && (
            <View className={styles.pay}>
              <Button className={styles.button} type="primary" onClick={onPay}>
                <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
                {payType === 1 ? (
                  <Text className={styles.payText}>{`支付${price}元查看剩余内容`}</Text>
                ) : (
                  <Text className={styles.payText}>{`支付${attachmentPrice}元查看付费内容`}</Text>
                )}
              </Button>
            </View>
          )}
        </>
      )}
    </>
  );
};

export default React.memo(Index);

// 处理
const WrapperView = ({ children, onClick, videoH = 0 }) => {
  const [styleH, setStyleH] = useState({})
  useEffect(() => {
    if (videoH > 0) {
      setStyleH({ minHeight: `${videoH}px` })
    } else {
      setStyleH({})
    }
  }, [videoH])

  return (
    <View className={styles.wrapperView} style={styleH}>
      {children}
      <View className={styles.placeholder} onClick={onClick}></View>
    </View>
  )
}
