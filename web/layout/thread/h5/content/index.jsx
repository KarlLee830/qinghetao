import React, { useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, Button } from '@discuzqsdk/design';
import { parseContentData } from '../../utils';
import ImageDisplay from '@components/thread/image-display';
import AudioPlay from '@components/thread/audio-play';
import PostContent from '@components/thread/post-content';
import ProductItem from '@components/thread/product-item';
import VideoPlay from '@components/thread/video-play';
import VoteDisplay from '@components/thread/vote-display';
import PostRewardProgressBar, { POST_TYPE } from '@components/thread/post-reward-progress-bar';
import Tip from '@components/thread/tip';
import AttachmentView from '@components/thread/attachment-view';
import { minus } from '@common/utils/calculate';
import classnames from 'classnames';
import UserInfo from '@components/thread/user-info';
import styles from './index.module.scss';
import { debounce } from '@common/utils/throttle-debounce';
import IframeVideoDisplay from '@components/thread-post/iframe-video-display';
import Avatar from '@components/avatar';
import Packet from '@components/thread/packet';
import PacketOpen from '@components/red-packet-animation/h5';
import Router from '@discuzqsdk/sdk/dist/router';
import DZQPluginCenterInjectionPolyfill from '../../../../utils/DZQPluginCenterInjectionPolyfill';
import isServer from '@common/utils/is-server';


// 插件引入
/**DZQ->plugin->register<plugin_detail@thread_extension_display_hook>**/

// 帖子内容
const RenderThreadContent = (inject('index', 'site', 'user', 'thread', 'plugin')(observer((props) => {
  const { store: threadStore, site, index, thread, user } = props;
  const { text, indexes } = threadStore?.threadData?.content || {};
  const { parentCategoryName, categoryName } = threadStore?.threadData;
  const { hasRedPacket } = threadStore; // 是否有红包领取的数据

  const tipData = {
    postId: threadStore?.threadData?.postId,
    threadId: threadStore?.threadData?.threadId,
    platform: 'h5',
    payType: threadStore?.threadData?.payType,
  };
  // 是否合法
  const isApproved = (threadStore?.threadData?.isApproved || 0) === 1;
  const isEssence = threadStore?.threadData?.displayTag?.isEssence || false;

  // 是否免费帖
  const isFree = threadStore?.threadData?.payType === 0;

  // 是否作者自己
  const isSelf = props.user?.userInfo?.id && props.user?.userInfo?.id === threadStore?.threadData?.userId;
  // 是否已经付费
  const isPayed = threadStore?.threadData?.paid === true;
  // 是否可以免费查看付费帖子
  const canFreeViewPost = threadStore?.threadData?.ability.canFreeViewPost;
  // 是否附件付费帖
  const isAttachmentPay = threadStore?.threadData?.payType === 2 && threadStore?.threadData?.paid === false;
  const attachmentPrice = threadStore?.threadData?.attachmentPrice || 0;
  // 是否需要附加付费
  const needAttachmentPay = !canFreeViewPost && isAttachmentPay && !isSelf && !isPayed;
  // 是否付费帖子
  const isThreadPay = threadStore?.threadData?.payType === 1;
  const threadPrice = threadStore?.threadData?.price || 0;

  // 当前用户是否需要付费
  const isNeedPay = threadStore?.threadData?.payType === 1 && threadStore?.threadData?.paid === false;

  // 是否红包帖
  const isRedPack = threadStore?.threadData?.displayTag?.isRedPack;
  // 是否悬赏帖
  const isReward = threadStore?.threadData?.displayTag?.isReward;

  // 是否打赏帖
  const isBeReward = isFree && threadStore?.threadData?.ability.canBeReward && !isRedPack && !isReward;
  // 是否显示打赏按钮： 免费帖 && 不是自己 && 不是红包 && 不是悬赏 && 允许被打赏
  // const canBeReward = isFree && !isRedPack && !isReward;
  // 是否已打赏
  const isRewarded = threadStore?.threadData?.isReward;

  const parseContent = parseContentData(indexes);

  if (user.isLogin() && isApproved && parseContent.RED_PACKET?.condition === 1) { // 如果是集赞红包则查询一下红包领取状态
    threadStore.getRedPacketInfo(parseContent.RED_PACKET.threadId);
  }

  const onContentClick = async () => {
    typeof props.onPayClick === 'function' && props.onPayClick();
  };

  const onTagClick = () => {
    typeof props.onTagClick === 'function' && props.onTagClick();
  };

  const onMoreClick = () => {
    props.fun.moreClick();
  };

  const onLikeClick = () => {
    typeof props.onLikeClick === 'function' && props.onLikeClick();
  };

  const onBuyClick = (url) => {
    url && window.open(url);
  };

  const onRewardClick = () => {
    typeof props.onRewardClick === 'function' && props.onRewardClick();
  };

  const onUserClick = (e) => {
    typeof props.onUserClick === 'function' && props.onUserClick(e);
  };
  const postLoad = () => {
    threadStore.setContentImgLength();
  };
  useEffect(() => {
    if (parseContent.IMAGE?.length === threadStore.contentImgLength || !parseContent.IMAGE) {
      props.setContentImgReady();
    }
  }, [threadStore.contentImgLength]);
  const {
    canDownloadAttachment,
    canViewAttachment,
    canViewVideo
  } = threadStore?.threadData?.ability || {};

  const { tipList } = threadStore?.threadData || {};

  return (
    <div className={`${styles.container}`}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <UserInfo
            name={threadStore?.threadData?.user?.nickname || ''}
            avatar={threadStore?.threadData?.user?.avatar || ''}
            location={threadStore?.threadData?.position.location || ''}
            groupName={threadStore?.threadData?.group?.groupName || ''}
            groupLevel={threadStore?.threadData?.group?.level || 0}
            view={`${threadStore?.threadData?.viewCount}` || ''}
            time={`${threadStore?.threadData?.diffTime}` || ''}
            isEssence={isEssence}
            isPay={!isFree}
            isReward={isReward}
            isRed={isRedPack}
            userId={threadStore?.threadData?.user?.userId}
            onClick={onUserClick}
          ></UserInfo>
        </div>
        {props?.user?.isLogin() && isApproved && (
          <div className={styles.more} onClick={onMoreClick}>
            <Icon size={20} color="#8590A6" name="MoreVOutlined"></Icon>
          </div>
        )}
      </div>

      <div className={styles.body}>
        {/* 标题 */}
        {threadStore?.threadData?.title && <div className={styles.title}>{threadStore?.threadData?.title}</div>}

        {/* 文字 */}
        {text && <PostContent needShowMore={false} content={text || ''} />}

        {/* 视频 */}
        {parseContent.VIDEO && parseContent.VIDEO.needPay !== 1 && (
          <VideoPlay
            url={parseContent.VIDEO.mediaUrl}
            coverUrl={parseContent.VIDEO.coverUrl}
            v_height={parseContent.VIDEO.height || null}
            v_width={parseContent.VIDEO.width || null}
            status={parseContent.VIDEO.status}
            canViewVideo={canViewVideo}
          />
        )}
        {/* 外插视频 */}
        {parseContent.IFRAME && (
          <IframeVideoDisplay content={parseContent.IFRAME.content} />
        )}

        {/* 图片 */}
        {parseContent.IMAGE && (
          <ImageDisplay
            postLoad={postLoad}
            flat
            platform="h5"
            imgData={parseContent.IMAGE}
            isPay={needAttachmentPay}
            onPay={onContentClick}
          />
        )}

        {(parseContent.RED_PACKET || parseContent.REWARD) && (
          <div className={styles.reward}>
            {/* 悬赏 */}
			{site.webConfig.setSite.siteAreward[1].value && (
			    <>
					{parseContent.REWARD && (
					  <div className={styles.rewardBody} style={{ width: '100%' }}>
						{/* <PostRewardProgressBar
						  type={POST_TYPE.BOUNTY}
						  remaining={Number(parseContent.REWARD.remainMoney || 0)}
						  received={minus(
							Number(parseContent.REWARD.money || 0),
							Number(parseContent.REWARD.remainMoney || 0),
						  )}
						/> */}
						<Packet
						  type={1}
						  money={parseContent.REWARD.money}
						  remainMoney={parseContent.REWARD.remainMoney}
						/>
						<div className={styles.rewardText}>
						  <div className={styles.rewardMoney}>
							本帖向所有人悬赏
							<span className={styles.rewardNumber}>{parseContent.REWARD.money || 0}</span>元
						  </div>
						  <div className={styles.rewardTime}>{parseContent.REWARD.expiredAt}截止悬赏</div>
						</div>
					  </div>
					)}
				</>
			)}
            {/* 红包 */}
			{site.webConfig.setSite.siteRedpacket[1].value && (
			    <>
					{parseContent.RED_PACKET && (
					  <div style={{ width: '100%' }}>
						{/* <PostRewardProgressBar
							remaining={Number(parseContent.RED_PACKET.remainNumber || 0)}
							received={
							  Number(parseContent.RED_PACKET.number || 0) - Number(parseContent.RED_PACKET.remainNumber || 0)
							}
							condition={parseContent.RED_PACKET.condition}
						  /> */}
						<Packet
						  number={parseContent.RED_PACKET.number}
						  remainNumber={parseContent.RED_PACKET.remainNumber}
						  condition={parseContent.RED_PACKET.condition}
						/>
						{!!parseContent.RED_PACKET.condition && (
						  <div className={styles.redPacketLikeNum}>评论集{parseContent.RED_PACKET.likenum}赞领红包</div>
						)}
					  </div>
					)}
				</>
			)}
          </div>
        )}

        {/* 商品 */}
		{site.webConfig.setSite.siteShop[1].value && (
		    <>
				{parseContent.GOODS && (
				  <div>
					<ProductItem
					  image={parseContent.GOODS.imagePath}
					  amount={parseContent.GOODS.price}
					  title={parseContent.GOODS.title}
					  className={styles.product}
					/>
					<Button
					  className={styles.buyBtn}
					  type="danger"
					  onClick={() => onBuyClick(parseContent.GOODS.detailContent)}
					>
					  <Icon className={styles.payIcon} name="ShoppingCartOutlined" size={20}></Icon>
					  <span className={styles.buyText}>购买商品</span>
					</Button>
				  </div>
				)}
		    </>
		)}
        {/* 音频 */}
        {parseContent.VOICE && <AudioPlay url={parseContent.VOICE.mediaUrl} />}

        {/* 附件 */}
        {parseContent.VOTE && (
          <AttachmentView
            attachments={parseContent.VOTE}
            threadId={threadStore?.threadData?.threadId}
            canDownloadAttachment={canDownloadAttachment}
            canViewAttachment={canViewAttachment}
          />
        )}

        {/* 投票 */}
        {parseContent.VOTE_THREAD
          && <VoteDisplay voteData={parseContent.VOTE_THREAD} threadId={threadStore?.threadData?.threadId} page="detail" />}

        <DZQPluginCenterInjectionPolyfill
          target='plugin_detail'
          hookName='thread_extension_display_hook'
          pluginProps={{
            threadData: threadStore?.threadData,
            renderData: parseContent.plugin,
            updateListThreadIndexes: index.updateListThreadIndexes.bind(index),
            updateThread: thread.updateThread.bind(thread),
        }}/>

        {/* 付费附件 */}
		{site.webConfig.setSite.sitePay[1].value && (
		    <>
				{needAttachmentPay && (
				  <div style={{ textAlign: 'center' }} onClick={onContentClick}>
					<Button className={styles.payButton} type="primary">
					  <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
					  <p>支付{attachmentPrice}元查看付费内容</p>
					</Button>
				  </div>
				)}
		    </>
		)}


          {/* 标签 */}
          {(parentCategoryName || categoryName) && (
            <div className={styles.tag} onClick={onTagClick}>
              {parentCategoryName ? `${parentCategoryName}/${categoryName}` : categoryName}
            </div>
          )}

        {/* 帖子付费 */}
		{site.webConfig.setSite.sitePay[1].value && (
		    <>
				{!canFreeViewPost && isThreadPay && !isSelf && !isPayed && (
				  <div style={{ textAlign: 'center' }} onClick={onContentClick}>
					<Button className={styles.payButton} type="primary">
					  <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
					  支付{threadPrice}元查看剩余内容
					</Button>
				  </div>
				)}
		    </>
		)}
        {/* 打赏 产品说web端全部放开，直接显示  */}
		{site.webConfig.setSite.siteRewards[1].value && (
			<div className={`${styles.rewardContianer} ${styles.kuqJuzhong}`}>
			  <Button onClick={onRewardClick} className={styles.rewardButton} type="primary">
				<Icon className={styles.payIcon} name="HeartOutlined" size={20}></Icon>
				<span className={styles.rewardext}>打 赏</span>
			  </Button>
			</div>
		)}
        {/* 打赏人员列表 */}
		
		{
		  tipList && tipList.length > 0 && (
			<div className={styles.moneyList}>
			  <div className={styles.top}>{tipList.length}人打赏</div>
			  <div className={styles.itemList}>
				{tipList.map(i=>(
				  <div key={i.userId} onClick={()=>Router.push({ url: `/user/${i.userId}` })} className={styles.itemAvatar}>
					  <Avatar
						image={i.avatar}
						name={i.nickname}
						size='small'
					  />
				  </div>
				))}
			  </div>
		  </div>
		  )
		}
		
      </div>

      {isApproved && (
        <div className={styles.footer}>
          <div className={styles.thumbs}>
            {/* 付费 */}
            {isThreadPay && (
              <Icon
                className={classnames(styles.payIcon, isPayed && styles.actived)}
                name="GoldCoinOutlined"
                size={20}
              ></Icon>
            )}
            {/* 打赏 */}
            {isBeReward && (
              <Icon
                onClick={() => !isSelf && onRewardClick()}
                className={classnames(styles.payIcon, isRewarded && styles.actived)}
                name="HeartOutlined"
                size={20}
              ></Icon>
            )}
            {/* 点赞 */}
            <div
              className={classnames(styles.liked, threadStore?.threadData?.isLike && styles.actived)}
              onClick={debounce(onLikeClick, 500)}
            >
              <Icon name="LikeOutlined" size={20}></Icon>
              {threadStore?.threadData?.likeReward?.likePayCount > 0 && (
                <span className={styles.likedNumber}>{threadStore?.threadData?.likeReward?.likePayCount || ''}</span>
              )}
            </div>
            <div className={styles.likeReward}>
              <Tip
                tipData={tipData}
                imgs={threadStore?.threadData?.likeReward?.users || []}
                showMore={true}
                showCount={5}
                platform="h5"
              ></Tip>
            </div>
          </div>
          {threadStore?.threadData?.likeReward?.shareCount > 0 && (
            <div className={styles.shareCount}>{threadStore?.threadData?.likeReward?.shareCount}次分享</div>
          )}
        </div>
      )}

      {
        hasRedPacket > 0 &&  <PacketOpen onClose={() => threadStore.setRedPacket(0)} money={hasRedPacket} />
      }
    </div>
  );
})));

export default RenderThreadContent;
