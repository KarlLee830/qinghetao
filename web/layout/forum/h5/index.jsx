import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Popup, Icon } from '@discuzqsdk/design';
import Avatar from '@components/avatar';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import List from '@components/list';
import UserItem from '@components/thread/user-item';
import UserCenterUsers from '@components/user-center-users';
import { get } from '@common/utils/get';
import layout from './index.module.scss';
// import UserCenterFriends from '@components/user-center-friends';
import { simpleRequest } from '@common/utils/simple-request';
import Copyright from '@components/copyright';
import MemberBadge from '@components/member-badge';

@inject('site')
@inject('forum')
@inject('user')
@observer
class ForumH5Page extends React.Component {
  async componentDidMount() {
    await this.setUsersPageData(1);
  }

  nextUsersPage = async () => {
    const { forum} = this.props;
    return await this.setUsersPageData(forum.userPage + 1);
  }

  setUsersPageData = async (page = 1) => {
    const { forum } = this.props;
    const usersList = await simpleRequest('readUsersList', {
      params: {
        page,
        filter: {
          hot: 0,
        },
      },
    });
    forum.setUsersPageData(usersList);
  }

  onUserClick = ({ id }) => {
    this.props.router.push(`/user/${id}`);
  };

  onIntroduceClose = () => {
    this.props.forum.setIntroduceVisible(false)
  };

  onIntroduceOpen = () => {
    this.props.forum.setIntroduceVisible(true)
  };

  render() {
    const { site, forum, user: { group } } = this.props;
    const { platform } = site;
    const { usersPageData = [], isNoMore } = forum;
    // 创建时间
    const siteInstall = get(site, 'webConfig.setSite.siteInstall', '');
    // 站点模式
    const siteMode = get(site, 'webConfig.setSite.siteMode', '');
    // 站长信息
    const siteAuthor = get(site, 'webConfig.setSite.siteAuthor', '');
    return (
      <>
        <Header/>
        <HomeHeader/>
        <div className={layout.content}>
          <div className={layout.mainContent}>
            {/* 站点介绍 start */}
            <div className={layout.list}>
              <div className={layout.label}>站点介绍</div>
              <div className={layout.right} title={site.siteIntroduction} onClick={this.onIntroduceOpen}>
                <span className={layout.list_text_ellipsis}>{site.siteIntroduction}</span>
                <Icon size={10} color='#8590A6' name='RightOutlined'/>
              </div>
            </div>
            {/* 站点介绍 end */}
            {/* 创建时间 start */}
            <div className={layout.list}>
              <div className={layout.label}>创建时间</div>
              <div className={layout.right}>{siteInstall}</div>
            </div>
            {/* 创建时间 end */}
            {/* 站点模式 start */}
            <div className={layout.list}>
                <div className={layout.label}>站点模式</div>
                <div className={layout.right}>
                  {
                    siteMode === 'public'
                      ? '公开模式'
                      : '付费模式'
                  }
                </div>
            </div>
            {/* 站点模式 end */}
            {/* 站长 start */}
            <div className={layout.list}>
              <div className={layout.label}>站长</div>
              <div className={layout.right}>
                <div className={layout.forum_agent}>
                  <Avatar
                    size='small'
                    className={layout.forum_agent_img}
                    image={siteAuthor.avatar}
                    name={siteAuthor.nickname}
                  />
                  <span className={layout.forum_agent_name}>{siteAuthor.nickname}</span>
                </div>
              </div>
            </div>
            {/* 站长 end */}
            {/* 成员 start */}
            <div className={layout.list}>
              <div className={layout.label}>成员</div>
              <div className={layout.right} onClick={() => forum.setIsPopup(true)}>
                <div className={layout.forum_member}>
                  {
                      usersPageData?.slice(0, 3).map(item => (
                        <Avatar size='small' key={item.userId} name={item.nickname} className={layout.forum_member_img} image={item.avatar}/>
                      ))
                  }
                  <Icon size={10} color='#8590A6' name='RightOutlined'/>
                </div>
              </div>
            </div>
            {/* 成员 end */}
            {/* 我的角色 start */}
            <div className={layout.list}>
              <div className={layout.label}>我的角色</div>
              {
                group.level
                  ? <MemberBadge
                      groupLevel={group.level}
                      groupName={group?.groupName}
                    />
                  : <div className={layout.right}>{group?.groupName}</div>
              }
            </div>
            {/* 我的角色 end */}
            {/* 当前版本 start */}
            <div className={layout.list}>
              <div className={layout.label}>当前版本</div>
              <div className={layout.right}>{site.version || '暂无版本号'}</div>
            </div>
            {/* 当前版本 end */}
          </div>
          <Copyright />
        </div>
        {/* 成员列表弹出 */}
        <Popup
          position="bottom"
          visible={forum.isPopup}
          onClose={() => forum.setIsPopup(false)}
          containerClassName={layout.forum_users_popup}
        >
          <UserCenterUsers onContainerClick={this.onUserClick} itemStyle={{padding: '8px 16px'}}/>
        </Popup>
        {
          platform === 'h5' && (
            <Popup
              position="bottom"
              visible={forum.introduceVisible}
              onClose={this.onIntroduceClose}
            >
              <div className={layout.popup_introduce}>
                <div className={layout.introduce_content}>
                  <pre>
                    {site.siteIntroduction}
                  </pre>
                </div>
              </div>
            </Popup>
          )
        }
      </>
    );
  }
}

export default withRouter(ForumH5Page);
