import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Icon, Button, Toast, Avatar, Spin } from '@discuzqsdk/design';
import NoData from '@components/no-data';
import { copyToClipboard } from '@common/utils/copyToClipboard';
import layout from './index.module.scss';
import { numberFormat } from '@common/utils/number-format';
import BaseLayout from '@components/base-layout';
import h5Share from '@discuzqsdk/sdk/dist/common_modules/share/h5';
import Copyright from '@components/copyright';
import MorePopop from '@components/more-popop';
import SharePopup from '@components/thread/share-popup';
import MemberBadge from '@components/member-badge';
import Router from '@discuzqsdk/sdk/dist/router';
import isWeiXin from '@common/utils/is-weixin';

@inject('site')
@inject('user')
@inject('invite')
@observer
class InviteH5Page extends React.Component {
  state = {
    visible: false,
    loadWeiXin: false,
    show: false,
  }

  async componentDidMount() {
    try {
      this.setState({ loadWeiXin: isWeiXin() });
      await this.props.invite.getInviteUsersList();
    } catch (e) {
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
  onClose = () => {
    this.setState({ visible: false });
  }

  onCancel = () => {
    this.setState({ show: false });
  }

  handleH5Share = () => {
    try {
      const { site: { setSite: { siteName } = {} } = {}, user } = this.props;
      h5Share({ title: `邀请您加入${siteName || ''}`, path: `/forum/partner-invite?inviteCode=${user.id}` });
      Toast.success({
        content: '创建邀请链接成功',
        duration: 1000,
      });
      this.onCancel();
    } catch (e) {
      Toast.error({
        content: e.Message || e,
      });
    }
  }

  handleWxShare = () => {
    this.setState({ visible: true });
    this.onCancel();
  }

  createCard = () => {
    Router.push({ url: '/card' });
  }

  handleExperience = () => {
    Router.push({ url: `/card?experience=1` });
  }

  handleClick = () => {
    const { user } = this.props;
    if (!user.isLogin()) {
      goToLoginPage({ url: '/user/login' });
      return;
    }
    this.setState({ show: true });
  }

  render() {
    const { inviteData, inviteUsersList, isNoData, inviteLoading } = this.props.invite;
    const { visible, loadWeiXin } = this.state;

    return (
      <>
        <BaseLayout
          right={ this.renderRight }
          onRefresh={this.loadMore}
          showRefresh={false}
          isShowLayoutRefresh={false}
          hideCopyright
        >
        <div className={layout.content}>
          <div className={layout.mainContent}>
            <div>
              {/* 头部 start */}
              <div className={layout.header}></div>
              {/* 头部 end */}
              {/* 用户信息 start */}
              <div className={layout.user_info}>
                <div className={layout.user_info_author}>
                  <Avatar
                    size={'big'}
                    image={inviteData.avatar}
                    text={inviteData.nickname && inviteData.nickname.substring(0, 1)}
                  />
                </div>
                <div className={layout.user_info_content}>
                  <div className={layout.user_info_name} title={inviteData.nickname}>{inviteData.nickname}</div>
                  {
                    inviteData.level ?
                    <div className={layout.memberBadgeBox}>
                      <MemberBadge
                        groupLevel={inviteData.level}
                        groupName={inviteData.groupName}
                      />
                    </div>
                    :
                    <div className={layout.user_info_tag}>{inviteData.groupName}</div>
                  }
                  <div className={layout.user_info_invite}>
                    <div className={layout.invite_num}>
                      <div className={layout.invite_num_title}>已邀人数</div>
                      <div
                        className={layout.invite_num_content}
                        title={numberFormat(inviteData.totalInviteUsers)}
                      >
                        {numberFormat(inviteData.totalInviteUsers)}
                      </div>
                    </div>
                    <div className={layout.invite_money}>
                      <div className={layout.invite_num_title}>赚得赏金</div>
                      <div className={layout.invite_num_content} title={inviteData.totalInviteBounties}>{inviteData.totalInviteBounties || 0}</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* 用户信息 end */}
              {/* 邀请列表 start */}
              <div className={layout.invite_list}>
                <div className={layout.invite_list_title}>
                  <Icon className={layout.invite_list_titleIcon} color='#FFC300' name='IncomeOutlined'/>
                  <div className={layout.invite_list_titleText}>邀请列表</div>
                </div>
                <div className={layout.invite_list_header}>
                  <span className={layout.invite_list_headerName}>成员昵称</span>
                  <span className={layout.invite_list_headerMoney}>获得赏金</span>
                  <span className={layout.invite_list_headerTime}>推广时间</span>
                </div>
                <div className={layout.invite_list_content}>
                  {
                    inviteUsersList?.map((item, index) => (
                      <div key={index} className={layout.invite_list_item}>
                          <div className={layout.invite_list_itemName} title={item.nickname || '--'}>
                            <Avatar
                              className={layout.invite_list_itemAvatar}
                              image={item.avatar}
                              size='small'
                              text={item?.nickname?.substring(0, 1)}
                            />
                            <span>{item.nickname || '--'}</span>
                          </div>
                          <div className={layout.invite_list_itemMoney} title={`+${item.bounty}`}><span>+{item.bounty}</span></div>
                          <div className={layout.invite_list_itemTime} title={item.joinedAt || '--'}><span>{item.joinedAt || '--'}</span></div>
                          <div className={layout.invite_list_itemLine}></div>
                      </div>
                    ))
                  }
                  <div className={layout.bottom_tips_wrap}>
                    {inviteLoading && <div className={layout.loadMoreContainer}><Spin type={'spinner'}>加载中 ...</Spin></div>}
                    {
                      !inviteLoading && isNoData
                      && <div className={layout.lineSty}>
                            <span className={layout.noMoreLeft}></span>
                            <span>没有更多内容了</span>
                            <span className={layout.noMoreRight}></span>
                        </div>
                    }
                  </div>
                </div>
              </div>
              {/* 邀请列表 end */}
            </div>
            <Copyright />
          </div>
          {/* 邀请朋友 start */}
          <div className={layout.invite_bottom}>
            <Button
              className={layout.invite_bottom_button}
              onClick={this.handleClick}
            >
              邀请朋友
            </Button>
          </div>
          {/* 邀请朋友 end */}
          <MorePopop
            show={this.state.show}
            site={this.props.site}
            user={this.props.user}
            onClose={this.onCancel}
            handleH5Share={this.handleH5Share}
            handleWxShare={this.handleWxShare}
            handleExperience={this.handleExperience}
            createCard={this.createCard}
          ></MorePopop>
          {loadWeiXin && <SharePopup visible={visible} onClose={this.onClose} />}
        </div>
        </BaseLayout>
      </>
    );
  }
}

export default withRouter(InviteH5Page);
