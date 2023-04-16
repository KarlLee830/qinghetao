import React from 'react';
import Avatar from '@components/avatar';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import { View, Text, Image } from '@tarojs/components';
import { diffDate } from '@common/utils/diff-date';
import { observer, inject } from 'mobx-react';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import classNames from 'classnames';
import ImageDisplay from '@components/thread/image-display';
import { handleLink } from '@components/thread/utils';
import Router from '@discuzqsdk/sdk/dist/router';
import PostContent from '@components/thread/post-content';
import { debounce } from '@common/utils/throttle-debounce';
import { IMG_SRC_HOST } from '@common/constants/site';
import styles from './index.module.scss';
// import redPacketMini from '../../../../../../web/public/dzq-img/redpacket-mini.png';
// import coin from '../../../../../../web/public/dzq-img/coin.png';
import ReplyList from '../reply-list/index';
import MemberBadge from '@components/member-badge';

const coin = `${IMG_SRC_HOST}/assets/coin.e66d1d9205f2d6a18b38fe29b733eb109e168504.png`;
const redPacketMini = `${IMG_SRC_HOST}/assets/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png`;
@inject('site')
@inject('user')
@observer
class CommentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHideEdit: this.props.isHideEdit, // 隐藏评论编辑删除
      isShowOne: this.props.isShowOne || false, // 是否只显示一条评论回复
    };
    this.needReply = this.props?.data?.lastThreeComments; // 评论的回复

  }

  toCommentDetail = (data) => {
    typeof this.props.onCommentClick === 'function' && this.props.onCommentClick(data);
  };

  filterContent() {
    let newContent = this.props?.data?.content || '';
    newContent = s9e.parse(newContent);
    newContent = xss(newContent);

    return newContent;
  }

  // 点击评论赞
  likeClick() {
    typeof this.props.likeClick === 'function' && this.props.likeClick();
  }

  // 点击评论回复
  replyClick() {
    typeof this.props.replyClick === 'function' && this.props.replyClick();
  }

  // 点击评论删除
  deleteClick() {
    typeof this.props.deleteClick === 'function' && this.props.deleteClick();
  }

  // 点击回复删除
  replyDeleteClick(data) {
    this.setState({
      replyId: data?.id,
    });
    typeof this.props.replyDeleteClick === 'function' && this.props.replyDeleteClick(data);
  }

  // 点击回复赞
  replyLikeClick(data) {
    typeof this.props.replyLikeClick === 'function' && this.props.replyLikeClick(data);
  }

  // 点击回复回复
  replyReplyClick(data) {
    typeof this.props.replyReplyClick === 'function' && this.props.replyReplyClick(data);
  }

  // 点击头像
  avatarClick() {
    typeof this.props?.avatarClick === 'function' && this.props.avatarClick();
  }
  // 点击评论列表用户头像
  replyAvatarClick(data, floor) {
    typeof this.props.replyAvatarClick === 'function' && this.props.replyAvatarClick(data, floor);
  }

  generatePermissions(data = {}) {
    return {
      canApprove: data?.canApprove || false,
      canDelete: data?.canDelete || false,
      canEdit: data?.canEdit || false,
      canHide: data?.canHide || false,
      canLike: data?.canLike || false,
    };
  }

  handleClick(e, node) {
    e && e.stopPropagation();
    const { url, isExternaLink } = handleLink(node);
    if (isExternaLink) return;

    if (url) {
      Router.push({ url });
    } else {
      this.toCommentDetail();
    }
  }

  render() {
    const { canDelete, canEdit, canLike, canHide } = this.generatePermissions(this.props.data);
    const { groups } = this.props.data?.user || {};
    // 评论内容是否通过审核
    const isApproved = this.props?.data?.isApproved === 1;
    const isSelf = this.props.threadId === this.props?.data?.userId;
    const { redPacketData, disabledReply = false } = this.props;
    const remainHongbaoLike = redPacketData?.condition === 1 && redPacketData?.remainNumber; // 是否还有剩余的点赞红包
    const needLikeNum = redPacketData?.likenum;
    const curLikeNum = this.props?.data?.likeCount;
    const isCommenter = this.props?.data?.userId === this.props?.user?.userInfo?.id;
    const { site } = this.props

    return (
      <View className={styles.commentList}>
        <View className={styles.header}>
          <View className={styles.showGet}>
            <View></View>
            <View className={styles.headerRigth}>
            {site.webConfig.setSite.siteRedpacket[2].value && (
              <>
                  {
                    isCommenter && remainHongbaoLike * 1 > 0 && curLikeNum < needLikeNum && !this.props.data?.redPacketAmount && (
                      <View className={styles.hongbaoLikeNum}>
                        <Icon className={styles.iconzan} size={12} name="PraiseOutlined"></Icon>
                        再集 <View className={styles.redfont}>&nbsp;{needLikeNum - curLikeNum}&nbsp;</View> 赞可领红包
                      </View>
                    )
                  }
	            </>
			      )}
            {site.webConfig.setSite.siteAreward[2].value && (
              <>
                {this.props.data?.rewards ? (
                  <View className={styles.imageNumber}>
                    <Image className={styles.rewardImage} src={coin} alt="悬赏图标" />
                    <View className={styles.showMoneyNum}>
                      获得<Text className={styles.moneyNumber}>&nbsp;{this.props.data.rewards}&nbsp;</Text>元悬赏金
                    </View>
                  </View>
                ) : (
                  ''
                )}
              </>
            )}
            {site.webConfig.setSite.siteRedpacket[2].value && (
              <>
                {this.props.data?.redPacketAmount ? (
                  <View className={`${styles.redpacket} ${styles.imageNumber}`}>
                    <Image className={styles.image} src={redPacketMini} alt="红包图标" />
                    <View className={styles.showMoneyNum}>
                      获得<Text className={styles.moneyNumber}>&nbsp;{this.props.data.redPacketAmount}&nbsp;</Text>元红包
                    </View>
                  </View>
                ) : (
                  ''
                )}
                {!this.state.isShowOne ? (
                  <View className={styles.more} onClick={this.props.onMoreClick}>
                    <Icon size={20} color="#8590A6" name="MoreVOutlined" className={styles.moreIcon}></Icon>
                  </View>
                ) : (
                  ''
                )}
              </>
            )}
            </View>
          </View>
        </View>
        <View className={styles.content}>
          {/* 评论用户头像 */}
          <View className={styles.commentListAvatar} onClick={() => this.avatarClick()}>
            <Avatar
              image={
                (this.props.data?.user?.nickname || this.props.data?.user?.userName) && this.props?.data?.user?.avatar
              }
              name={this.props.data?.user?.nickname || this.props.data?.user?.userName || '异'}
              circle
            ></Avatar>
          </View>
          <View className={styles.commentListContent}>
            <View onClick={this.handleClick.bind(this)} className={`${styles.commentListContentText} ${this.props.active && styles.active}`}>
              <View className={styles.commentHeader}>
                <View className={styles.userInfo}>
                  <View className={styles.commentListName}>
                    {this.props.data?.user?.nickname || this.props.data?.user?.userName || '用户异常'}
                  </View>
                  {(isSelf && !this.props.isAnonymous) && (
                    <View className={styles.masterBox}>
                      <Text className={styles.masterText}>作者</Text>
                    </View>
                  )}
                  {!!groups?.isDisplay && (
                    <View className={styles.groupsBox}>
                      {
                        groups?.level ?
                          <MemberBadge
                            groupLevel={groups?.level}
                            groupName={groups?.name || groups?.groupName}
                            groupNameStyle={{ maxWidth: '100px' }}
                          />
                          :
                          <View className={styles.groups}>{groups?.name || groups?.groupName}</View>
                      }
                    </View>
                  )}
                </View>
                {!isApproved ? <View className={styles.isApproved}>审核中</View> : <View></View>}
              </View>
              {/* 评论内容 */}
              {site.webConfig.setSite.siteComment[2].value && (
                <>
                  <View className={classNames(styles.commentListText)}>
                    <PostContent
                      onRedirectToDetail={() => this.toCommentDetail()}
                      useShowMore={!!this.state.isShowOne}
                      content={this.props?.data?.content}
                      customHoverBg
                    ></PostContent>
                  </View>
                </>
              )}
              {/* <RichText
                className={classNames(styles.commentListText, this.state.isShowOne && styles.isShowOne)}
                content={this.filterContent()}
                onClick={this.handleClick.bind(this)}
              /> */}
              {/* 图片展示 */}
              {this.props.data?.images ? (
                <View className={styles.imageDisplay}>
                  <ImageDisplay platform="h5" imgData={this.props.data?.images} />
                </View>
              ) : (
                ''
              )}
            </View>

            {/* 底部操作栏 */}
            {this.props.data?.user && (
              <View className={styles.commentListFooter}>
                <View className={styles.commentBtn}>
                  <View className={styles.commentTime}>{diffDate(this.props.data.createdAt)}</View>
                  <View className={styles.extraBottom}>
                    <View className={this.props?.data?.isLiked ? styles.commentLike : styles.commentLiked}>
                      <Text onClick={debounce(() => this.likeClick(canLike), 500)}>
                        赞&nbsp;{this.props?.data?.likeCount > 0 ? this.props.data.likeCount : ''}
                      </Text>
                    </View>
                    {!disabledReply && <View className={styles.commentReply}>
                      <Text onClick={() => this.replyClick()}>回复</Text>
                    </View>
                    }
                    {this.props.isShowAdopt && (
                      <View className={styles.commentAdopt}>
                        <Text onClick={() => this.props.onAboptClick()}>采纳</Text>
                      </View>
                    )}
                    {!this.state.isHideEdit && canHide && (
                      <View className={styles.extra}>
                        {canHide && (
                          <View className={styles.revise} onClick={debounce(() => this.deleteClick(), 500)}>
                            删除
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>
                {
                  this.props.originThread || ''
                }
                {this.props.data?.replyCount - 1 > 0 && this.state.isShowOne ? (
                  <View className={styles.moreReply} onClick={() => this.toCommentDetail()}>
                    查看之前{this.props.data?.replyCount - 1}条回复...
                  </View>
                ) : (
                  ''
                )}
                {this.needReply?.length > 0 && (
                  <View className={styles.replyList}>
                    {this.state.isShowOne ? (
                      <ReplyList
                        data={this.needReply[0]}
                        key={this.needReply[0].id}
                        isShowOne
                        avatarClick={(floor) => this.replyAvatarClick(this.needReply[0], floor)}
                        likeClick={() => this.replyLikeClick(this.needReply[0])}
                        replyClick={() => this.replyReplyClick(this.needReply[0])}
                        deleteClick={() => this.replyDeleteClick(this.needReply[0])}
                        toCommentDetail={() => this.toCommentDetail()}
                        threadId={this.props.threadId}
                        isAnonymous={this.props.isAnonymous}
                        disabledReply={disabledReply}
                      ></ReplyList>
                    ) : (
                      (this.needReply || []).map((val, index) => (
                        <View key={val.id || index} ref={val.id === this.props.postId ? this.props.positionRef : null}>
                          <ReplyList
                            data={val}
                            avatarClick={(floor) => this.replyAvatarClick(val, floor)}
                            likeClick={() => this.replyLikeClick(val)}
                            replyClick={() => this.replyReplyClick(val)}
                            deleteClick={() => this.replyDeleteClick(val)}
                            toCommentDetail={() => this.toCommentDetail(val)}
                            active={val.id === this.props.postId}
                            threadId={this.props.threadId}
                            isAnonymous={this.props.isAnonymous}
                            disabledReply={disabledReply}
                          ></ReplyList>
                        </View>
                      ))
                    )}
                  </View>
                )}
              </View>
            )}

          </View>
        </View>
      </View>
    );
  }
}

export default CommentList;
