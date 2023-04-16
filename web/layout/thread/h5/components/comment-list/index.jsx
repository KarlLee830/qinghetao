import React from 'react';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import { Icon } from '@discuzqsdk/design';
import ReplyList from '../reply-list/index';
import { diffDate } from '@common/utils/diff-date';
import { observer, inject } from 'mobx-react';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import ImageDisplay from '@components/thread/image-display';
import classNames from 'classnames';
import PostContent from '@components/thread/post-content';
import { debounce } from '@common/utils/throttle-debounce';
import SiteMapLink from '@components/site-map-link';
import MemberBadge from '@components/member-badge';

@inject('user')
@observer
class CommentList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      // isHideEdit: this.props.isHideEdit, // 隐藏评论编辑删除
      isShowOne: this.props.isShowOne || false, // 是否只显示一条评论回复
    };
    this.needReply = this.props.data.lastThreeComments; // 评论的回复
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

  // 点击头像
  avatarClick() {
    typeof this.props?.avatarClick === 'function' && this.props.avatarClick();
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

  // 点击评论编辑
  editClick() {
    typeof this.props.editClick === 'function' && this.props.editClick();
  }

  // 点击回复赞
  replyLikeClick(data) {
    typeof this.props.replyLikeClick === 'function' && this.props.replyLikeClick(data);
  }

  // 点击回复回复
  replyReplyClick(data) {
    typeof this.props.replyReplyClick === 'function' && this.props.replyReplyClick(data);
  }

  // 点击回复删除
  replyDeleteClick(data) {
    typeof this.props.replyDeleteClick === 'function' && this.props.replyDeleteClick(data);
  }

  // 点击评论列表用户头像
  replyAvatarClick(data, floor) {
    typeof this.props.replyAvatarClick === 'function' && this.props.replyAvatarClick(data, floor);
  }

  generatePermissions(data = {}) {
    return {
      canApprove: data.canApprove || false,
      canDelete: data.canDelete || false,
      canEdit: data.canEdit || false,
      canHide: data.canHide || false,
      canLike: data.canLike || false,
    };
  }

  render() {
    const { canDelete, canEdit, canLike, canHide } = this.generatePermissions(this.props.data);
    const { groups } = this.props.data?.user || {};
    const isSelf = this.props.threadId === this.props?.data?.userId;
    const { thread } = this.props;
    // 评论内容是否通过审核
    const isApproved = this.props?.data?.isApproved === 1;
    const { redPacketData, disabledReply = false } = this.props;
    const remainHongbaoLike = redPacketData?.condition === 1 && redPacketData?.remainNumber; // 是否还有剩余的点赞红包
    const needLikeNum = redPacketData?.likenum;
    const curLikeNum = this.props?.data?.likeCount;
    const isCommenter = this.props?.data?.userId === this.props?.user?.userInfo?.id;

    return (
      <div className={`${styles.commentList} dzq-comment`}>
        <div className={styles.header}>
          <div className={styles.showGet}>
            <div></div>
            <div className={styles.headerRigth}>
              {
                isCommenter && remainHongbaoLike * 1 > 0 && curLikeNum < needLikeNum && !this.props.data?.redPacketAmount && (
                  <div className={styles.hongbaoLikeNum}>
                    <Icon className={styles.iconzan} size={12} name="PraiseOutlined"></Icon>
                    再集 <span> &nbsp;{needLikeNum - curLikeNum} &nbsp;</span> 赞可领红包
                  </div>
                )
              }
              {this.props.data?.rewards ? (
                <div className={styles.imageNumber}>
                  <img className={styles.rewardImage} src="/dzq-img/coin.png" alt="悬赏图标" />
                  <div className={styles.showMoneyNum}>
                    获得<span className={styles.moneyNumber}>&nbsp;{this.props.data.rewards}&nbsp;</span>元悬赏金
                  </div>
                </div>
              ) : (
                ''
              )}
              {this.props.data?.redPacketAmount ? (
                <div className={`${styles.redpacket} ${styles.imageNumber}`}>
                  <img className={styles.image} src="/dzq-img/redpacket-mini.png" alt="红包图标" />
                  <div className={styles.showMoneyNum}>
                    获得<span className={styles.moneyNumber}>&nbsp;{this.props.data.redPacketAmount}&nbsp;</span>元红包
                  </div>
                </div>
              ) : (
                ''
              )}
              {!this.state.isShowOne ? (
                <div className={styles.more} onClick={this.props.onMoreClick}>
                  <Icon size={20} color="#8590A6" name="MoreVOutlined" className={styles.moreIcon}></Icon>
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        </div>
        <div className={styles.content}>
          <div className={styles.commentListAvatar} onClick={() => this.avatarClick()}>
            <SiteMapLink href={`/user/${this.props?.data?.userId}`} text={this.props.data?.user?.nickname || this.props.data?.user?.userName || '异'} />
            {/* 头像和昵称*/}
            <Avatar
              image={
                (this.props.data?.user?.nickname || this.props.data?.user?.userName) && this.props.data?.user?.avatar
              }
              name={this.props.data?.user?.nickname || this.props.data?.user?.userName || '异'}
              circle={true}
            ></Avatar>
          </div>
          {/* 评论内容*/}
          <div className={styles.commentListContent}>
            <SiteMapLink href={`/thread/comment/${this.props?.data.id}?threadId=${thread?.threadData?.id}`} text={this.props?.data?.content} />
            <div className={`${styles.commentListContentText} ${this.props.active && styles.active}`}>
              <div className={styles.commentHeader}>
                <div className={styles.userInfo}>
                  <div className={styles.commentListName}>
                    {this.props.data?.user?.nickname || this.props.data?.user?.userName || '用户异常'}
                  </div>
                  {(isSelf && !this.props.isAnonymous) && (
                    <div className={styles.masterBox}>
                      <span className={styles.masterText}>作者</span>
                    </div>
                  )}
                  {!!groups?.isDisplay && (
                    <div className={styles.groupsBox}>
                      {
                        groups?.level ?
                          <MemberBadge
                            groupLevel={groups?.level}
                            groupName={groups?.name || groups?.groupName}
                            groupNameStyle={{ maxWidth: '100px' }}
                          />
                          :
                          <div className={styles.groups}>{groups?.name || groups?.groupName}</div>
                      }
                    </div>
                  )}
                </div>
                {!isApproved ? <div className={styles.isApproved}>审核中</div> : <div></div>}
              </div>
              <div className={classNames(styles.commentListText)}>
                <PostContent
                  onRedirectToDetail={() => this.toCommentDetail()}
                  useShowMore={!!this.state.isShowOne}
                  content={this.props?.data?.content}
                  customHoverBg={true}
                ></PostContent>
              </div>

              {/* <div
                className={classNames(styles.commentListText, this.props.isShowOne && styles.isShowOne)}
                dangerouslySetInnerHTML={{ __html: this.filterContent() }}
                onClick={() => this.toCommentDetail()}
              ></div> */}
              {/* 图片展示 */}
              {this.props.data?.images.length > 0 && (
                <div className={styles.imageDisplay}>
                  <ImageDisplay platform="h5" imgData={this.props.data?.images} />
                </div>
              )}
            </div>
            {this.props.data?.user && (
              <div className={styles.commentListFooter}>
                <div className={styles.commentBtn}>
                  <div className={styles.commentTime}>{diffDate(this.props.data.createdAt)}</div>
                  <div className={styles.extraBottom}>
                    <div className={this.props?.data?.isLiked ? styles.commentLike : styles.commentLiked}>
                      <span onClick={debounce(() => this.likeClick(canLike), 500)}>
                        赞&nbsp;{this.props?.data?.likeCount > 0 ? this.props.data.likeCount : ''}
                      </span>
                    </div>
                    {!disabledReply && <div className={styles.commentReply}>
                      <span onClick={() => this.replyClick()}>回复</span>
                    </div>
                    }
                    {this.props.isShowAdopt && (
                      <div className={styles.commentAdopt}>
                        <span onClick={() => this.props.onAboptClick()}>采纳</span>
                      </div>
                    )}
                    {canHide && (
                      <div className={styles.extra}>
                        {/* {canEdit && <div className={styles.revise} onClick={() => this.editClick()}>编辑</div>} */}
                        {canHide && (
                          <div className={styles.revise} onClick={() => this.deleteClick()}>
                            删除
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {this.props.data?.replyCount - 1 > 0 && this.state.isShowOne ? (
                  <div className={styles.moreReply} onClick={() => this.toCommentDetail()}>
                    查看之前{this.props.data?.replyCount - 1}条回复...
                  </div>
                ) : (
                  ''
                )}
                {/* 添加查看原帖入口组件，从外部传入 */}
                {this.props.originThread || ''}
                {this.needReply?.length > 0 && (
                  <div className={styles.replyList}>
                    {this.state.isShowOne ? (
                      <ReplyList
                        isAnonymous={this.props.isAnonymous}
                        data={this.needReply[0]}
                        key={this.needReply[0].id}
                        isShowOne={true}
                        avatarClick={floor => this.replyAvatarClick(this.needReply[0], floor)}
                        likeClick={() => this.replyLikeClick(this.needReply[0])}
                        replyClick={() => this.replyReplyClick(this.needReply[0])}
                        deleteClick={() => this.replyDeleteClick(this.needReply[0])}
                        toCommentDetail={() => this.toCommentDetail()}
                        threadId={this.props.threadId}
                        disabledReply={disabledReply}
                      ></ReplyList>
                    ) : (
                      (this.needReply || []).map((val, index) => (
                        <div key={val.id || index} ref={val.id === this.props.postId ? this.props.positionRef : null}>
                          <ReplyList
                            isAnonymous={this.props.isAnonymous}
                            data={val}
                            key={val.id || index}
                            avatarClick={floor => this.replyAvatarClick(val, floor)}
                            likeClick={() => this.replyLikeClick(val)}
                            replyClick={() => this.replyReplyClick(val)}
                            deleteClick={() => this.replyDeleteClick(val)}
                            toCommentDetail={() => this.toCommentDetail(val)}
                            active={this.props.postId === val.id}
                            threadId={this.props.threadId}
                            disabledReply={disabledReply}
                          ></ReplyList>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default CommentList;
