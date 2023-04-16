import React from 'react';
import { inject, observer } from 'mobx-react';
import { View, Text ,Image} from '@tarojs/components';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import RichText from '@discuzqsdk/design/dist/components/rich-text/index';
import Router from '@discuzqsdk/sdk/dist/router';
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
import Packet from '@components/thread/packet'
import Avatar from '@components/avatar';
import DZQPluginCenterInjection from '@discuzqsdk/plugin-center/dist/components/DZQPluginCenterInjection';
import { setClipboardData } from '@tarojs/taro';
import { parseContentData } from '../../utils';
import styles from './index.module.scss';

// 插件引入
/**DZQ->plugin->register<plugin_detail@thread_extension_display_hook>**/

// 帖子内容
const RenderThreadContent = inject('index', 'site', 'user', 'plugin', 'thread', 'threadPost')(
  observer((props) => {
    const { store: threadStore, site, index, thread, user } = props;
    const { text, indexes } = threadStore?.threadData?.content || {};
    const { parentCategoryName, categoryName } = threadStore?.threadData;
    const { webConfig: { other: { threadOptimize } } } = site;

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

    // 是否可以免费查看付费帖子
    const canFreeViewPost = threadStore?.threadData?.ability.canFreeViewPost;

    // 是否已经付费
    const isPayed = threadStore?.threadData?.paid === true;

    // 是否作者自己
    const isSelf = props.user?.userInfo?.id && props.user?.userInfo?.id === threadStore?.threadData?.userId;

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
    const isBeReward = isFree && threadOptimize && !isRedPack && !isReward;
    // 是否显示打赏按钮： 免费帖 && 不是自己 && 不是红包 && 不是悬赏 && 允许被打赏
    const canBeReward = isFree && threadOptimize && !isRedPack && !isReward;
    // 是否已打赏
    const isRewarded = threadStore?.threadData?.isReward;

    const parseContent = parseContentData(indexes);

    if ( user.isLogin() && isApproved && parseContent.RED_PACKET?.condition === 1) { // 如果是集赞红包则查询一下红包领取状态
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
      setClipboardData({
        data: url,
        success: () => {
          // hideToast();
          // Toast.info({
          //   content: '商品地址已复制，请在浏览器上黏贴访问',
          // });
        },
      });
    };

    const onRewardClick = () => {
      typeof props.onRewardClick === 'function' && props.onRewardClick();
    };

    const onUserClick = () => {
      const userId = threadStore?.threadData?.user?.userId
      if (!userId) return
      Router.push({ url: `/userPages/user/index?id=${userId}` });
    }
    const {
      canDownloadAttachment,
      canViewAttachment,
      canViewVideo
    } = threadStore?.threadData?.ability || {};

    const { tipList } = threadStore?.threadData || {};


    return (
      <View className={`${styles.container}`}>
        <View className={styles.header}>
          <View className={styles.userInfo}>
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
              userId={threadStore?.threadData?.user?.userId}
              isReward={isReward}
              isRed={isRedPack}
              onClick={onUserClick}
              hasMoreIcon={props?.user?.isLogin() && isApproved}
            ></UserInfo>
          </View>
          {props?.user?.isLogin() && isApproved && (
            <View className={styles.more} onClick={onMoreClick}>
              <Icon size={20} className={styles.icon} name="MoreVOutlined"></Icon>
            </View>
          )}
        </View>

        <View className={styles.body}>
          {/* 标题 */}
          {threadStore?.threadData?.title && <View className={styles.title}>{threadStore?.threadData?.title}</View>}

          {/* 文字 */}
          {text && <PostContent useShowMore={false} content={text || ''} />}

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

          {/* 外部视频iframe插入和上面的视频组件是互斥的 */}
          {(parseContent.IFRAME && parseContent.IFRAME.content) && (
            <RichText
              content={parseContent.IFRAME.content}
              iframeWhiteList={['bilibili', 'youku', 'iqiyi', 'music.163.com', 'qq.com', 'em.iq.com', 'xigua']}
              onClick={() => { }}
              onImgClick={() => { }}
              onLinkClick={() => { }}
              transformer={parseDom => parseDom}
            />
          )}

          {/* 图片 */}
          {parseContent.IMAGE && (
            <ImageDisplay
              flat
              isPay={needAttachmentPay}
              onPay={onContentClick}
              platform="h5"
              imgData={parseContent.IMAGE}
            />
          )}

          {(parseContent.RED_PACKET || parseContent.REWARD) && (
            <View className={styles.reward} style={{ width: '100%' }}>
              {/* 悬赏 */}
              {site.webConfig.setSite.siteAreward[2].value && (
                <>
                  {parseContent.REWARD && (
                    <View className={styles.rewardBody}>
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
                      <View className={styles.rewardText}>
                        <View className={styles.rewardMoney}>
                          本帖向所有人悬赏
                          <Text className={styles.rewardNumber}>{parseContent.REWARD.money || 0}</Text>元
                        </View>
                        <View className={styles.rewardTime}>{parseContent.REWARD.expiredAt}截止悬赏</View>
                      </View>
                    </View>
                  )}
                </>
              )}
              {/* 红包 */}
              {site.webConfig.setSite.siteRedpacket[2].value && (
                <>
                  {parseContent.RED_PACKET && (
                    <View style={{ width: '100%' }}>
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
                        <View className={styles.redPacketLikeNum}>评论集{parseContent.RED_PACKET.likenum}赞领红包</View>
                      )}
                    </View>
                  )}
                </>
              )}
            </View>
          )}

          {/* 商品 */}
          {site.webConfig.setSite.siteShop[2].value && (
            <>
              {parseContent.GOODS && (
                <View>
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
                    <Text className={styles.buyText}>购买商品</Text>
                  </Button>
                </View>
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
          {/* 付费附件 */}
          {site.webConfig.setSite.sitePay[2].value && (
            <>
              {needAttachmentPay && (
                <View style={{ textAlign: 'center' }} onClick={onContentClick}>
                  <Button className={styles.payButton} type="primary">
                    <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
                    <View>支付{attachmentPrice}元查看付费内容</View>
                  </Button>
                </View>
              )}
            </>
          )}
          <DZQPluginCenterInjection
            target='plugin_detail'
            hookName='thread_extension_display_hook'
            pluginProps={{
              threadData: threadStore?.threadData,
              renderData: parseContent.plugin,
              updateListThreadIndexes: index.updateListThreadIndexes.bind(index),
              updateThread: thread.updateThread.bind(thread),
          }}/>

          {/* 标签 */}
          {(parentCategoryName || categoryName) && (
            <View className={styles.tag} onClick={onTagClick}>
              {parentCategoryName ? `${parentCategoryName}/${categoryName}` : categoryName}
            </View>
          )}

          {/* 帖子付费 */}
          {site.webConfig.setSite.sitePay[2].value && (
            <>
              {!canFreeViewPost && isThreadPay && !isSelf && !isPayed && (
                <View style={{ textAlign: 'center' }} onClick={onContentClick}>
                  <Button className={styles.payButton} type="primary">
                    <Icon className={styles.payIcon} name="GoldCoinOutlined" size={16}></Icon>
                    支付{threadPrice}元查看剩余内容
                  </Button>
                </View>
              )}
            </>
          )}

          {/* 打赏 */}
          {site.webConfig.setSite.siteRewards[2].value && (
            <>
              {canBeReward && isApproved && !isSelf && (
                <View className={styles.rewardContianer}>
                  <Button onClick={onRewardClick} className={styles.rewardButton} type="primary">
                    <Icon className={styles.payIcon} name="HeartOutlined" size={20}></Icon>
                    <Text className={styles.rewardext}>打赏</Text>
                  </Button>
                </View>
              )}
              {/* 打赏人员列表 */}
              {
                tipList && tipList.length > 0 && (
                  <View className={styles.moneyList}>
                    <View className={styles.top}>{tipList.length}人打赏</View>
                    <View className={styles.itemList}>
                        {tipList.map(i=>(
                          <View key={i.userId} onClick={()=>Router.push({ url: `/userPages/user/index?id=${i.userId}` })} className={styles.itemAvatar}>
                            <Avatar
                              image={i.avatar}
                              name={i.nickname}
                              size='small'
                            />
                          </View>
                        ))}
                    </View>
                  </View>
                )
              }
            </>
          )}

        </View>

        {isApproved && (
          <View className={styles.footer}>
            <View className={styles.thumbs}>
              {/* 付费 */}
              {site.webConfig.setSite.sitePay[2].value && (
                <>
                  {isThreadPay && (
                    <Icon
                      className={classnames(styles.payIcon, isPayed && styles.actived)}
                      name="GoldCoinOutlined"
                      size={20}
                    ></Icon>
                  )}
                </>
              )}
              {/* 打赏 */}
              {site.webConfig.setSite.siteAreward[2].value && (
                <>
                  {isBeReward && (
                    <Icon
                      onClick={() => !isSelf && onRewardClick()}
                      className={classnames(styles.payIcon, isRewarded && styles.actived)}
                      name="HeartOutlined"
                      size={20}
                    ></Icon>
                  )}
                </>
              )}
              {/* 点赞 */}
              <View
                className={classnames(styles.liked, threadStore?.threadData?.isLike && styles.actived)}
                onClick={onLikeClick}
              >
                <Icon name="LikeOutlined" size={20}></Icon>
                {threadStore?.threadData?.likeReward?.likePayCount > 0 && (
                  <Text className={styles.likedNumber}>{threadStore?.threadData?.likeReward?.likePayCount || ''}</Text>
                )}
              </View>
              <View className={styles.likeReward}>
                <Tip
                  tipData={tipData}
                  imgs={threadStore?.threadData?.likeReward?.users || []}
                  showMore={true}
                  showCount={5}
                ></Tip>
              </View>
            </View>
            {threadStore?.threadData?.likeReward?.shareCount > 0 && (
              <View className={styles.shareCount}>{threadStore?.threadData?.likeReward?.shareCount}次分享</View>
            )}
          </View>
        )}


      </View>
    );
  }),
);

export default RenderThreadContent;
