import React from 'react';
import { inject, observer } from 'mobx-react';
import ImageDisplay from '@components/thread/image-display';
// import ImageDisplay from '@components/thread/image-content';
import AudioPlay from '@components/thread/audio-play';
import PostContent from '@components/thread/post-content';
import ProductItem from '@components/thread/product-item';
import VideoPlay from '@components/thread/video-play';
import VoteDisplay from '@components/thread/vote-display';
import PostRewardProgressBar, { POST_TYPE } from '@components/thread/post-reward-progress-bar';
import Tip from '@components/thread/tip';
import AttachmentView from '@components/thread/attachment-view';
import { Icon, Button, Divider, Dropdown, Toast } from '@discuzqsdk/design';
import UserInfo from '@components/thread/user-info';
import classnames from 'classnames';
import topic from './index.module.scss';
import { minus } from '@common/utils/calculate';
import { parseContentData } from '../../utils';
import { debounce } from '@common/utils/throttle-debounce';
import IframeVideoDisplay from '@components/thread-post/iframe-video-display';
import Avatar from '@components/avatar';

import Packet from '@components/thread/packet';
import PacketOpen from '@components/red-packet-animation/web';
import Router from '@discuzqsdk/sdk/dist/router';
import DZQPluginCenterInjectionPolyfill from '../../../../utils/DZQPluginCenterInjectionPolyfill';
// import DZQPluginCenterInjection from '../../../../utils/DZQPluginCenterInjection';
import isServer from '@common/utils/is-server';

// 插件引入
/** DZQ->plugin->register<plugin_detail@thread_extension_display_hook>**/

// 帖子内容
const RenderThreadContent = (inject('index', 'site', 'user', 'thread', 'plugin')(observer((props) => {
  const { store: threadStore, site, index, thread, user } = props;
  const { text, indexes } = threadStore?.threadData?.content || {};
  const { parentCategoryName, categoryName } = threadStore?.threadData;
  const { hasRedPacket } = threadStore; // 是否有红包领取的数据
  const tipData = {
    postId: threadStore?.threadData?.postId,
    threadId: threadStore?.threadData?.threadId,
    platform: 'pc',
    payType: threadStore?.threadData?.payType,
  };
  // 是否合法
  const isApproved = (threadStore?.threadData?.isApproved || 0) === 1;

  // 是否免费帖
  const isFree = threadStore?.threadData?.payType === 0;

  // 是否加精
  const isEssence = threadStore?.threadData?.displayTag?.isEssence || false;
  // 是否海报
  const isPoster = threadStore?.threadData?.displayTag?.isPoster || false;
  // 是否置顶
  const isStick = threadStore?.threadData?.isStick;
  // 更多弹窗权限
  const canEdit = threadStore?.threadData?.ability?.canEdit;
  const canDelete = threadStore?.threadData?.ability?.canDelete;
  const canEssence = threadStore?.threadData?.ability?.canEssence;
  const canPoster = threadStore?.threadData?.ability?.canPoster;
  const canStick = threadStore?.threadData?.ability?.canStick;

  // 是否作者自己
  const isSelf = props.user?.userInfo?.id && props.user?.userInfo?.id === threadStore?.threadData?.userId;
  // 是否已经付费
  const isPayed = threadStore?.threadData?.paid === true;
  // 是否可以免费查看付费帖子
  const canFreeViewPost = threadStore?.threadData?.ability.canFreeViewPost;
  // 是否部分付费
  const isAttachmentPay = threadStore?.threadData?.payType === 2 && threadStore?.threadData?.paid === false;
  const attachmentPrice = threadStore?.threadData?.attachmentPrice || 0;
  // 是否需要部分付费
  const needAttachmentPay = !canFreeViewPost && isAttachmentPay && !isSelf && !isPayed;
  // 是否帖子付费
  const isThreadPay = threadStore?.threadData?.payType === 1;
  const threadPrice = threadStore?.threadData?.price || 0;

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

  const onLikeClick = () => {
    typeof props.onLikeClick === 'function' && props.onLikeClick();
  };

  const onCollectionClick = () => {
    typeof props.onCollectionClick === 'function' && props.onCollectionClick();
  };

  const onShareClick = () => {
    typeof props.onShareClick === 'function' && props.onShareClick();
  };

  const onBuyClick = (url) => {
    url && window.open(url);
  };

  const onDropdownChange = (key) => {
    typeof props.onOperClick === 'function' && props.onOperClick(key);
  };

  const onRewardClick = () => {
    typeof props.onRewardClick === 'function' && props.onRewardClick();
  };

  const onTagClick = () => {
    typeof props.onTagClick === 'function' && props.onTagClick();
  };

  const onUserClick = (e) => {
    e && e.stopPropagation();
    typeof props.onUserClick === 'function' && props.onUserClick();
  };
  const {
    canDownloadAttachment,
    canViewAttachment,
    canViewVideo,
  } = threadStore?.threadData?.ability || {};

  const { tipList, isAnonymous } = threadStore?.threadData || {};

 console.log(site.webConfig.setSite)

  return (
    <div className={`${topic.container}`}>
      <div className={topic.header}>
        <div className={topic.userInfo}>
          <UserInfo
            name={threadStore?.threadData?.user?.nickname || ''}
            avatar={threadStore?.threadData?.user?.avatar || ''}
            groupName={isAnonymous ? '' : (threadStore?.threadData?.group?.groupName || '')}
            groupLevel={threadStore?.threadData?.group?.level || 0}
            location={threadStore?.threadData?.position.location || ''}
            view={`${threadStore?.threadData?.viewCount}` || ''}
            time={`${threadStore?.threadData?.diffTime}` || ''}
            userId={threadStore?.threadData?.user?.userId}
            isEssence={isEssence}
			isPoster={isPoster}
            isPay={!isFree}
            isReward={isReward}
            isRed={isRedPack}
            hideInfoPopip={true}
            platform="pc"
            onClick={onUserClick}
          ></UserInfo>
        </div>
        {props?.user?.isLogin() && (
          <div className={topic.more}>
            {/* 当存在任一标签时，显示分割线 */}
            {(isEssence || isPoster || !isFree || isReward || isRedPack) && (
              <Divider mode="vertical" className={topic.moreDivider}></Divider>
            )}

            {isApproved && (canEdit || canStick || canEssence || canPoster || canDelete) && (
              <div className={topic.iconText}>
                <Dropdown
                  menu={
                    <Dropdown.Menu>
                      {canEdit && <Dropdown.Item id="edit">编辑</Dropdown.Item>}
                      {canStick && <Dropdown.Item id="stick">{isStick ? '取消置顶' : '置顶'}</Dropdown.Item>}
                      {canEssence && <Dropdown.Item id="essence"> {isEssence ? '取消精华' : '精华'}</Dropdown.Item>}
					  {/* 海报设置 */}
					  {canPoster && <Dropdown.Item id="poster"> {isPoster ? '取消海报' : '海报'}</Dropdown.Item>}
                      {canDelete && <Dropdown.Item id="delete">删除</Dropdown.Item>}
                    </Dropdown.Menu>
                  }
                  placement="center"
                  hideOnClick={true}
                  arrow={false}
                  trigger="hover"
                  onChange={key => onDropdownChange(key)}
                >
                  <Icon className={topic.icon} name="SettingOutlined"></Icon>
                  <span className={topic.text}>管理</span>
                </Dropdown>
              </div>
            )}
            {!props?.user?.isAdmini && (
              <div
                className={classnames(topic.iconText, props?.user?.isAdmini && topic.disabled)}
                onClick={() => onDropdownChange('report')}
              >
                <Icon className={topic.icon} name="WarnOutlinedThick"></Icon>
                <span className={topic.text}>举报</span>
              </div>
            )}
          </div>
        )}
      </div>

      <Divider className={topic.divider}></Divider>

      <div className={topic.body}>
        {/* 标题 */}
        {threadStore?.threadData?.title && <div className={topic.title}>{threadStore?.threadData?.title}</div>}

        {/* 文字 */}
        {text && <PostContent needShowMore={false} content={text || ''} usePointer={false} />}

        {/* 视频 */}
        {parseContent.VIDEO && parseContent.VIDEO.needPay !== 1 && (
          <VideoPlay
            url={parseContent.VIDEO.mediaUrl}
            coverUrl={parseContent.VIDEO.coverUrl}
            v_width={parseContent.VIDEO.width || null}
            v_height={parseContent.VIDEO.height || null}
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
            flat
            platform="pc"
            isPay={needAttachmentPay}
            onPay={onContentClick}
            imgData={parseContent.IMAGE}
          />
        )}

        {(parseContent.RED_PACKET || parseContent.REWARD) && (
          <div className={topic.reward} style={{ width: '100%' }} >
            {/* 悬赏 */}
			{site.webConfig.setSite.siteAreward[0].value && (
			    <>
					{parseContent.REWARD && (
					  <div className={topic.rewardBody} style={{ width: '100%' }}>
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
						<div className={topic.rewardMoney}>
						  本帖向所有人悬赏
						  <span className={topic.rewardNumber}>{parseContent.REWARD.money || 0}</span>元
						</div>
						<div className={topic.rewardTime}>{parseContent.REWARD.expiredAt}截止悬赏</div>
					  </div>

					)}
				</>
			)}
            {/* 红包 */}
			
			{site.webConfig.setSite.siteRedpacket[0].value && (
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
						  <div className={topic.redPacketLikeNum}>评论集{parseContent.RED_PACKET.likenum}赞领红包</div>
						)}
					  </div>
					)}
				</>
			)}
          </div>
        )}

        {/* 商品 */}

		{site.webConfig.setSite.siteShop[0].value && (
		    <>
				{parseContent.GOODS && (
				  <div className={topic.goods}>
					<ProductItem
					  image={parseContent?.GOODS?.imagePath}
					  amount={parseContent?.GOODS?.price}
					  title={parseContent?.GOODS?.title}
					  onClick={() => onBuyClick(parseContent.GOODS.detailContent)}
					/>
					<Button
					  className={topic.buyBtn}
					  type="danger"
					  onClick={() => onBuyClick(parseContent.GOODS.detailContent)}
					>
					  <div className={topic.buyContent}>
						<Icon className={topic.buyIcon} name="ShoppingCartOutlined" size={20}></Icon>
						<span className={topic.buyText}>购买商品</span>
					  </div>
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
            canViewAttachment={canViewAttachment}
            canDownloadAttachment={canDownloadAttachment}
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

        {/* 付费附件：不能免费查看付费帖 && 需要付费 && 不是作者 && 没有付费 */}
		{site.webConfig.setSite.sitePay[0].value && (
		    <>
				{needAttachmentPay && (
				  <div style={{ textAlign: 'center' }} onClick={onContentClick}>
					<Button className={topic.payButton} type="primary" size="large">
					  <div className={topic.pay}>
						<Icon className={topic.payIcon} name="GoldCoinOutlined" size={18}></Icon>
						支付{attachmentPrice}元查看付费内容
					  </div>
					</Button>
				  </div>
				)}
		    </>
		)}

        {/* 标签 */}
        {(parentCategoryName || categoryName) && (
          <div className={topic.tag} onClick={onTagClick}>
            {parentCategoryName ? `${parentCategoryName}/${categoryName}` : categoryName}
          </div>
        )}

        {/* 帖子付费：不能免费查看付费帖 && 需要付费 && 不是作者 && 没有付费 */}

		{site.webConfig.setSite.sitePay[0].value && (
		    <>
				{!canFreeViewPost && isThreadPay && !isSelf && !isPayed && (
				  <div style={{ textAlign: 'center' }} onClick={onContentClick}>
					<Button className={topic.payButton} type="primary" size="large">
					  <div className={topic.pay}>
						<Icon className={topic.payIcon} name="GoldCoinOutlined" size={18}></Icon>
						支付{threadPrice}元查看剩余内容
					  </div>
					</Button>
				  </div>
				)}
			</>
		)}

		{/* 打赏 产品说web端全部放开，直接显示 */}

		{site.webConfig.setSite.siteRewards[0].value && (
		  <div className={topic.rewardButton}>
		  	<Button onClick={onRewardClick} className={topic.rewardButton} type="primary" size="large">
		  	  <div className={topic.buttonIconText}>
		  		<Icon className={topic.buttonIcon} name="HeartOutlined" size={19}></Icon>
		  		<span className={topic.buttonText}>打赏</span>
		  	  </div>
		  	</Button>
		  </div>
		)}

        

        {/* 打赏人员列表 */}
        {
          tipList && tipList.length > 0 && (
            <div className={topic.moneyList}>
              <div className={topic.top}>{tipList.length}人打赏</div>
              <div className={topic.itemList}>
                  {tipList.map(i => (
                    <div key={i.userId} onClick={() => Router.push({ url: `/user/${i.userId}` })} className={topic.itemAvatar}>
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

      {/* 点赞分享 */}
      <div className={topic.footer}>
        <div className={topic.thumbs}>
          <div className={topic.likeReward}>
            <Tip
              tipData={tipData}
              imgs={threadStore?.threadData?.likeReward?.users || []}
              showCount={10}
              platform="pc"
            ></Tip>
          </div>
          <span>{threadStore?.threadData?.likeReward?.likePayCount || ''}</span>
        </div>
        {threadStore?.threadData?.likeReward?.shareCount > 0 && (
          <span className={topic.share}>{threadStore?.threadData?.likeReward?.shareCount}次分享</span>
        )}
      </div>

      <Divider className={topic.divider}></Divider>

      {/* 操作按钮 */}
      {
        isApproved && (
          <div className={topic.bottomOperate}>
            <div
              className={classnames(topic.item, threadStore?.threadData?.isLike && topic.active)}
              onClick={debounce(onLikeClick, 500)}
            >
              <Icon name="LikeOutlined"></Icon>
              <span>赞</span>
            </div>
            <div
              className={classnames(topic.item, threadStore?.threadData?.isFavorite && topic.active)}
              onClick={debounce(onCollectionClick, 500)}
            >
              <Icon name="CollectOutlined"></Icon>
              <span>收藏</span>
            </div>
            <div className={classnames(topic.item)} onClick={debounce(onShareClick, 500)}>
              <Icon name="ShareAltOutlined"></Icon>
              <span>分享</span>
            </div>
          </div>
        )}
      {
        hasRedPacket > 0 && <PacketOpen onClose={() => threadStore.setRedPacket(0)} money={hasRedPacket} />
      }
    </div>
  );
})));

export default RenderThreadContent;
