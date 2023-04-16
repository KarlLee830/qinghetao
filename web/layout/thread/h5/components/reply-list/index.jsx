import React from 'react';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import { diffDate } from '@common/utils/diff-date';
import { observer } from 'mobx-react';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import classnames from 'classnames';
import ImageDisplay from '@components/thread/image-display';
import { debounce } from '@common/utils/throttle-debounce';
import { urlToLink } from '@common/utils/replace-url-to-a';
import PostContent from '@components/thread/post-content';
import MemberBadge from '@components/member-badge';

@observer
export default class ReplyList extends React.Component {
  likeClick() {
    typeof this.props.likeClick === 'function' && this.props.likeClick();
  }
  replyClick() {
    typeof this.props.replyClick === 'function' && this.props.replyClick();
  }

  deleteClick() {
    typeof this.props.deleteClick === 'function' && this.props.deleteClick();
  }

  avatarClick(floor) {
    typeof this.props.avatarClick === 'function' && this.props.avatarClick(floor);
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

  filterContent() {
    let newContent = this.props?.data?.content || '';
    newContent = s9e.parse(newContent);
    newContent = xss(newContent);
    newContent = urlToLink(newContent);
    return newContent;
  }

  transformer = (parsedDom) => {
    const isSelf = (this.props.threadId === this.props?.data?.commentUserId)
    const hasAvatarImage = !!this.props?.data?.commentUser?.avatar;
    const element = this.props.data.commentUserId ? (
      <div className={`${styles.commentUser} ${hasAvatarImage ? '' : styles.positionTop}`}>
        <span className={styles.iconAt}>@</span>
        <div
          className={styles.replyedAvatar}
          onClick={() => {
            this.avatarClick(3);
          }}
        >
          <Avatar
            className={styles.avatar}
            image={
              (this.props.data.commentUser.nickname || this.props.data.commentUser.userName) &&
              this.props.data.commentUser.avatar
            }
            name={this.props.data.commentUser.nickname || this.props.data.replyUser.userName || '异'}
            circle={true}
            size="small"
          ></Avatar>
        </div>
        <span
          className={styles.replyedUserName}
          onClick={() => {
            this.avatarClick(3);
          }}
        >
          {this.props.data.commentUser.nickname || this.props.data.commentUser.userName || '用户异常'}
        </span>
        {(isSelf && !this.props.isAnonymous) && (
          <div className={styles.masterBox}>
            <span className={styles.masterText}>作者</span>
          </div>
        )}
      </div>
    ) : (
      ''
    );


    parsedDom.unshift(element);

    return parsedDom
  };

  toCommentDetail = () => {
    typeof this.props.toCommentDetail === 'function' && this.props.toCommentDetail()
  }

  render() {
    const { canLike, canDelete, canHide } = this.generatePermissions(this.props.data);
    const { groups } = this.props.data?.user || {};
    const isSelf = this.props.threadId === this.props?.data?.userId;
    // 评论内容是否通过审核
    const isApproved = this.props?.data?.isApproved === 1;
    return (
      <div className={styles.replyList}>
        <div
          className={styles.replyListAvatar}
          onClick={() => {
            this.avatarClick(2);
          }}
        >
          <Avatar
            image={
              (this.props.data?.user?.nickname || this.props.data?.user?.userName) && this.props.data?.user?.avatar
            }
            name={this.props.data?.user?.nickname || this.props.data?.user?.userName || '异'}
            circle={true}
            size="small"
          ></Avatar>
        </div>
        <div className={styles.replyListContent}>
          <div className={`${styles.replyListContentText} ${this.props.active && styles.active}`}>
            <div className={styles.replyListName}>
              <div className={styles.userInfo}>
                <div className={styles.replyListName} onClick={() => { this.avatarClick(2) }}>
                  <span className={styles.replyListNameText}>{this.props.data?.user?.nickname || this.props.data?.user?.userName || '用户异常'}</span>
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
            <div className={styles.replyListText}>
              <div className={classnames(styles.content)}>
                <PostContent
                  onRedirectToDetail={() => this.toCommentDetail()}
                  transformer={this.transformer}
                  useShowMore={!!this.props.isShowOne}
                  content={this.props?.data?.content}
                  customHoverBg={true}
                ></PostContent>
              </div>

              {/* 图片展示 */}
              {(this.props.data?.images?.length || this.props.data?.attachments?.length) && (
                <div className={styles.imageDisplay}>
                  <ImageDisplay platform="h5" imgData={this.props.data?.images || this.props.data?.attachments} />
                </div>
              )}
            </div>
          </div>
          <div className={styles.replyListFooter}>
            <div className={styles.replyTime}>{diffDate(this.props.data.createdAt)}</div>

            {/* 操作按钮 */}
            {this.props.data?.user && (
              <div className={styles.extraBottom}>
                <div className={this.props?.data?.isLiked ? styles.replyLike : styles.replyLiked}>
                  <span onClick={debounce(() => this.likeClick(canLike), 500)}>
                    赞&nbsp;{this.props?.data?.likeCount === 0 ? '' : this.props.data.likeCount}
                  </span>
                </div>
                {!this.props.disabledReply &&
                  <div className={styles.replyReply}>
                    <span onClick={() => this.replyClick()}>回复</span>
                  </div>
                }
                {canHide && (
                  <div className={styles.replyDelete}>
                    <span onClick={() => this.deleteClick()}>删除</span>
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
