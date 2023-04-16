import React from 'react';
import { Icon, Toast, Button } from '@discuzqsdk/design';
import Avatar from '@components/avatar';
import styles from './index.module.scss';
import { diffDate } from '@common/utils/diff-date';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';

@inject('thread')
@observer
class AuthorInfo extends React.Component {
  constructor(props) {
    super(props);

    this.user = this.props.user || {};
  }

  // 点击关注
  onFollowClick() {
    typeof this.props.onFollowClick === 'function' && this.props.onFollowClick();
  }

  // 点击私信
  onPrivateLetter() {
    typeof this.props.onPrivateLetter === 'function' && this.props.onPrivateLetter();
  }

  // 点击用户头像/用户名跳转个人中心
  onPersonalPage() {
    typeof this.props.onPersonalPage === 'function' && this.props.onPersonalPage();
  }

  render() {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span>楼主</span>
        </div>
        <div className={styles.info}>
          <div className={styles.AuthorInfo}>
            <div className={styles.avatar}>
              <Avatar
                image={this.user.avatarUrl}
                name={this.user.nickname}
                circle={true}
                userId={this.user.id}
                platform="pc"
                onClick={() => this.onPersonalPage()}
              ></Avatar>
            </div>
            <div className={styles.information}>
              <div className={styles.name} onClick={() => this.onPersonalPage()}>{this.user.nickname || ''}</div>
              <div className={styles.dynamic}>活跃在 {diffDate(this.user.updatedAt)}</div>
            </div>
          </div>
          <div className={styles.theme}>
            <div className={styles.themeInfo}>
              <div className={styles.title}>主题</div>
              <div className={styles.number}>{this.user.threadCount}</div>
            </div>
            <div className={styles.themeInfo}>
              <div className={styles.title}>点赞</div>
              <div className={styles.number}>{this.user.likedCount}</div>
            </div>
            <div className={styles.themeInfo}>
              <div className={styles.title}>已关注</div>
              <div className={styles.number}>{this.user.followCount}</div>
            </div>
            <div className={styles.themeInfo}>
              <div className={styles.title}>粉丝</div>
              <div className={styles.number}>{this.user.fansCount}</div>
            </div>
          </div>
        </div>
        {this.props.isShowBtn ? (
          <div className={styles.btn}>
            {/* 未关注 */}
            {!this.user.follow && (
              <Button type="primary" className={styles.follow} onClick={() => this.onFollowClick()}>
                <div className={styles.btnItem}>
                  <Icon name="PlusOutlined" size="14" className={styles.btnIcon}></Icon>
                  <span>关注</span>
                </div>
              </Button>
            )}

            {/* 已关注 */}
            {this.user.follow === 1 && (
              <Button
                type="primary"
                className={classnames(styles.follow, styles['is-followed'])}
                onClick={() => this.onFollowClick()}
              >
                <div className={styles.btnItem}>
                  <Icon name="CheckOutlined" size="14" className={styles.btnIcon}></Icon>
                  <span>已关注</span>
                </div>
              </Button>
            )}

            {/* 互相关注 */}
            {this.user.follow === 2 && (
              <Button
                type="primary"
                className={classnames(styles.follow, styles['with-followed'])}
                onClick={() => this.onFollowClick()}
              >
                <div className={styles.btnItem}>
                  <Icon name="WithdrawOutlined" size="14" className={styles.btnIcon}></Icon>
                  <span>互关</span>
                </div>
              </Button>
            )}

            <Button className={styles.privateLetter} onClick={() => this.onPrivateLetter()}>
              <div className={styles.btnItem}>
                <Icon name="CommentOutlined" size="14" className={styles.btnIcon}></Icon>
                <span>发私信</span>
              </div>
            </Button>
          </div>
        ) : (
          ''
        )}
      </div>
    );
  }
}

export default AuthorInfo;
