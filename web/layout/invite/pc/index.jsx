import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Icon, Toast, Avatar, Spin } from '@discuzqsdk/design';
import layout from './index.module.scss';
import NoData from '@components/no-data';
import BaseLayout from '@components/user-center-base-laout-pc';
import UserCenterFansPc from '@components/user-center/fans-pc';
import UserCenterFriendPc from '@components/user-center/friend-pc';
import { numberFormat } from '@common/utils/number-format';
import Copyright from '@components/copyright';
import { copyToClipboard } from '@common/utils/copyToClipboard';
import UserInfo from './components/userinfo';

@inject('site')
@inject('forum')
@inject('search')
@inject('invite')
@inject('user')
@observer
class InvitePCPage extends React.Component {
  containerRef = React.createRef(null);

  async componentDidMount() {
    try {
      const { invite } = this.props;
      await invite.getInviteUsersList();
    } catch (e) {
      const { invite } = this.props;
      invite.setInviteLoading(false);
      Toast.error({
        content: e.Message,
      });
    }
  }

  // 检查是否满足触底加载更多的条件
  checkLoadCondition() {
    const { invite } = this.props;
    const hasMorePage = invite.totalPage >= (invite.currentPage + 1);
    if (invite.inviteLoading) return false;
    if (!hasMorePage) return false;
    return true;
  }

  // 加载更多函数
  loadMore = async () => {
    const { invite } = this.props;
    if (!this.checkLoadCondition()) return;
    return await invite.getInviteUsersList(invite.currentPage + 1);
  };

  contentHeader = () => <div className={layout.content_header}></div>;

  // 右侧 - 潮流话题 粉丝 版权信息
  renderRight = () => {
    const { inviteData } = this.props.invite;
    const { pageData = [] } = this.props.search.topics || { pageData: [] };
    return (
      <>
        <UserInfo {...this.props} />
        <UserCenterFriendPc className={layout.user_center_wrap}/>
        <UserCenterFansPc  className={`${layout.user_center_wrap} invite-pc`}/>
        <Copyright/>
      </>
    );
  }
  render() {
    const { inviteUsersList, inviteLoading, isNoData, currentPage, totalPage } = this.props.invite;
    return (
      <BaseLayout
        right={ this.renderRight }
        onRefresh={this.loadMore}
        showRefresh={false}
        contentHeader={this.contentHeader}
        isShowLayoutRefresh={false}
        showLayoutRefresh={false}
      >
        <div
          className={layout.container}
        >
          <div className={layout.invite_list}>
            <div className={layout.invite_list_title}>
              <Icon size={16} name='IncomeOutlined' color='#FFC300'/>
              <span className={layout.title_text}>邀请列表</span>
            </div>
            <div className={layout.invite_list_label}>
              <div className={layout.list_label_nickname}>成员昵称</div>
              <div className={layout.list_label_money}>获得赏金</div>
              <div className={layout.list_label_timer}>加入时间</div>
            </div>
            <div className={layout.invite_list_main}>
              {
                inviteUsersList?.map((item) => (
                  <div key={item.toUserId} className={layout.list_main_wrap}>
                      <div className={layout.list_main_nickname}>
                        <Avatar
                          className={layout.user_value_avatar}
                          image={item.avatar}
                          text={item?.nickname?.substring(0, 1)}
                        />
                        <div className={layout.user_value_name} title={item.nickname}>{item.nickname || '匿名'}</div>
                      </div>
                      <div className={layout.list_main_money} title={`+${item.bounty}`}><span>+{item.bounty}</span></div>
                      <div className={layout.list_main_timer} title={item.joinedAt}><span>{item.joinedAt || '--'}</span></div>
                  </div>
                ))
              }
              {isNoData && <NoData className={layout.invite_list_nodata} text='没有更多内容了'/>}
              {inviteLoading && <div className={layout.loadMoreContainer}><Spin type={'spinner'}>加载中 ...</Spin></div>}
            </div>
          </div>
        </div>
      </BaseLayout>
    );
  }
}

export default withRouter(InvitePCPage);
