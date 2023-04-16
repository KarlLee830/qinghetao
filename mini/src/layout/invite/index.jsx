import React from 'react';
import { inject, observer } from 'mobx-react';
import { Image , View, Button } from '@tarojs/components';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Avatar from '@discuzqsdk/design/dist/components/avatar/index';
import { IMG_SRC_HOST } from '@common/constants/site';

import HomeHeader from '@components/home-header';
// import bgImage from './../../../../web/public/dzq-img/invite-banner-bg.png';
import NoMoreDataTip from '@components/no-more-data-tip';
import SiteShare from '@components/site-share';
import MemberBadge from '@components/member-badge';
import layout from './index.module.scss';

const bgImage = `${IMG_SRC_HOST}/assets/invite-banner-bg.8ebc5c7a58f15fe8979ce893715bf37422ae2e68.png`;

@inject('site')
@inject('user')
@inject('invite')
@observer
class InviteH5Page extends React.Component {
  state = {
    show: false,
  };

  async componentDidMount() {
    try {
      await this.props.invite.getInviteUsersList();
    } catch (e) {
      Toast.error({
        content: e.Message,
      });
    }
  }

  handleShareClick = () => {
    this.setState({ show: true })
  }

  onShareClose= () => {
    this.setState({ show: false})
  }

  render() {
    const { site, user, invite: { inviteData } } = this.props;
    const inviteCode = user?.userInfo?.id;
    const siteName = site?.webConfig?.setSite?.siteName || '';
    const shareData = {
      path: `/subPages/forum/partner-invite/index`,
      title: `邀请您加入 ${siteName}`,
    };

    return (
      <>
        <View class={layout.scroll}>
          {/* 头部全屏的背景图片 end */}
          <HomeHeader hideInfo showToolbar hideLogo fullScreenTitle="推广邀请" />
          {/* 头部全屏的背景图片 */}
          <View className={layout.top_bg}>
            <Image src={bgImage} className={layout.top_bg_image} />
          </View>
          <View className={layout.content}>
            {/* 用户信息 start */}
            <View className={layout.user_info}>
              <View className={layout.user_info_author}>
                <Avatar
                  size="big"
                  image={inviteData.avatar}
                  text={inviteData.nickname && inviteData.nickname.substring(0, 1)}
                />
              </View>
              <View className={layout.user_info_content}>
                <View className={layout.user_info_name}>{inviteData.nickname}</View>
                {
                  inviteData.level ?
                  <View className={layout.memberBadgeBox}>
                    <MemberBadge
                      groupLevel={inviteData.level}
                      groupName={inviteData.groupName}
                    />
                  </View>
                  :
                  <View className={layout.user_info_tag}>{inviteData.groupName}</View>
                }
                <View className={layout.user_info_invite}>
                  <View className={layout.invite_num}>
                    <View className={layout.invite_num_title}>已邀人数</View>
                    <View className={layout.invite_num_content}>{inviteData.totalInviteUsers}</View>
                  </View>
                  <View className={layout.invite_money}>
                    <View className={layout.invite_num_title}>赚得赏金</View>
                    <View className={layout.invite_num_content}>{inviteData.totalInviteBounties}</View>
                  </View>
                </View>
              </View>
            </View>
            {/* 用户信息 end */}
            {/* 邀请列表 start */}
            <View className={layout.invite_list}>
              <View className={layout.invite_list_title}>
                <Icon className={layout.invite_list_titleIcon} color='#FFC300' name='IncomeOutlined'/>
                <View className={layout.invite_list_titleText}>邀请列表</View>
              </View>
              <View className={layout.invite_list_header}>
                <View className={layout.invite_list_headerName}>成员昵称</View>
                <View className={layout.invite_list_headerMoney}>获得赏金</View>
                <View className={layout.invite_list_headerTime}>推广时间</View>
              </View>
              <View className={layout.invite_list_content}>
                {
                  inviteData?.inviteUsersList?.map((item, index) => (
                    <View key={index} className={layout.invite_list_item}>
                        <View className={layout.invite_list_itemName}>
                          <Avatar
                            className={layout.invite_list_itemAvatar}
                            image={item.avatar}
                            size='small'
                            text={item?.nickname?.substring(0, 1)}
                          />
                          <View className={layout.invite_list_username}>{item.nickname}</View>
                        </View>
                        <View className={layout.invite_list_itemMoney}>+{item.bounty}</View>
                        <View className={layout.invite_list_itemTime}>{item.joinedAt}</View>
                        <View className={layout.invite_list_itemLine}></View>
                    </View>
                  ))
                }
                {
                  inviteData?.inviteUsersList?.length
                    ? <></>
                    : <NoMoreDataTip />
                }
              </View>
            </View>
            {/* 邀请列表 end */}
          </View>
        </View>
        {/* 邀请朋友 start */}
        <View className={layout.footer}>
          <Button className={layout.button} onClick={this.handleShareClick}>
            邀请朋友
          </Button>
        </View>
        {this.state.show && <SiteShare show={this.state.show} onShareClose={this.onShareClose} inviteCode={inviteCode} customShareData={shareData} type='invite' user={user} site={site}></SiteShare>}
        {/* 邀请朋友 end */}
      </>
    );
  }
}

export default InviteH5Page;
