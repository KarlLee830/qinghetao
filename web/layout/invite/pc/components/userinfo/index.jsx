import React from 'react';
import { inject, observer } from 'mobx-react';
import layout from './index.module.scss';
import { Toast } from '@discuzqsdk/design';
import Avatar from '@components/avatar';
import { numberFormat } from '@common/utils/number-format';
import h5Share from '@discuzqsdk/sdk/dist/common_modules/share/h5';
import Router from '@discuzqsdk/sdk/dist/router';
import MemberBadge from '@components/member-badge';

function DefaultLayout(props) {
  const { inviteData, createInviteLink, onAvatarClick } = props;
  return (
    <div className={layout.user_card_wrap}>
      <div className={layout.user_card_main}>
        <div className={layout.user_card_avatar} onClick={() => onAvatarClick({ id: inviteData.userId })}>
          <Avatar
            size={'big'}
            userId={inviteData.userId}
            image={inviteData.avatar}
            name={inviteData.nickname && inviteData.nickname.substring(0, 1)}
          />
        </div>
        <div className={layout.user_card_info}>
          <div className={layout.user_info_name} title={inviteData.nickname}>{inviteData.nickname}</div>
          {
            inviteData.level
              ? <div>
                  <MemberBadge
                    groupLevel={inviteData.level}
                    groupName={inviteData.groupName}
                  />
                </div>
              : <div className={layout.user_info_tag}>{inviteData.groupName}</div>
          }
          <div className={layout.user_info_invite}>
            <div className={layout.invite_num}>
              <div className={layout.invite_num_title}>已邀人数</div>
              <div
                className={layout.invite_num_content}
                title={numberFormat(inviteData.totalInviteUsers)}>
                {numberFormat(inviteData.totalInviteUsers)}
              </div>
            </div>
            <div className={layout.invite_money}>
              <div className={layout.invite_num_title}>赚得赏金</div>
              <div
                className={layout.invite_num_content}
                title={inviteData.totalInviteBounties}>
                {inviteData.totalInviteBounties || 0}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={layout.user_card_button} onClick={createInviteLink}>邀请朋友</div>
    </div>
  );
}

function MiniLayout(props) {
  const { inviteData, createInviteLink, onAvatarClick } = props;

  return (
    <div className={layout.wrapper}>
      <div className={layout.user}>
        <div className={layout.userLeft}>
          <Avatar
            onClick={() => onAvatarClick({ id: inviteData.userId })}
            userId={inviteData.userId}
            image={inviteData.avatar}
            wrapClassName={layout.mini__avatar}
            name={inviteData.nickname && inviteData.nickname.substring(0, 1)}
          />
          <div className={layout.userName}>{ inviteData.nickname }</div>
          {
            inviteData.level
              ? <div>
                  <MemberBadge
                    groupLevel={inviteData.level}
                    groupName={inviteData.groupName}
                  />
                </div>
              : <div className={layout.userGroup}>{ inviteData.groupName }</div>
          }
        </div>
        <div className={layout.userRight}>
          <div className={layout.userTag}>
            <div className={layout.userTag_title}>已邀人数</div>
            <div className={layout.userTag_num} title={numberFormat(inviteData.totalInviteUsers)}>
              { numberFormat(inviteData.totalInviteUsers) }
            </div>
          </div>
          <div className={layout.line}></div>
          <div className={layout.userTag}>
            <div className={layout.userTag_title}>赚得赏金</div>
            <div className={layout.userTag_num} title={inviteData.totalInviteBounties}>
              { inviteData.totalInviteBounties || 0 }
            </div>
          </div>
        </div>
      </div>
      <div className={layout.user_card_button} onClick={createInviteLink}>邀请朋友</div>
    </div>
  );
}

function UserInfo(props) {
  const { invite } = props;
  const { inviteData } = invite;

  const createInviteLink = async () => {
    try {
      const { site: { setSite: { siteName } = {} } = {}, user } = props;
      // copyToClipboard(`${window.location.origin}/forum/partner-invite?inviteCode=${user.id}`);
      h5Share({ title: `邀请您加入${siteName || ''}`, path: `/forum/partner-invite?inviteCode=${user.id}` });
      Toast.success({
        content: '创建邀请链接成功',
        duration: 1000,
      });
    } catch (e) {
      Toast.error({
        content: e.Message || e,
      });
    }
  };
  const onAvatarClick = ({ id }) => {
    Router.push({ url: `/user/${id}` });
  };

  return (
    <>
      <DefaultLayout inviteData={inviteData} createInviteLink={createInviteLink} onAvatarClick={onAvatarClick}/>
      <MiniLayout inviteData={inviteData} createInviteLink={createInviteLink} onAvatarClick={onAvatarClick} />
    </>
  );
}

export default inject('invite', 'site')(observer(UserInfo));
