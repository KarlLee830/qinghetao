import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { Icon, Tag } from '@discuzqsdk/design';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import { diffDate } from '@common/utils/diff-date';
import classNames from 'classnames';
import SiteMapLink from '@components/site-map-link';
import MemberBadge from '@components/member-badge';
import MemberShipCard from '@components/member-ship-card';

UserInfo.propTypes = {
  name: PropTypes.string.isRequired, // 用户名称
  avatar: PropTypes.string.isRequired, // 用户头像
  groupName: PropTypes.string, // 用户组
  groupLevel: PropTypes.number, // 会员等级
  time: PropTypes.string, // 发帖时间
  location: PropTypes.string, // 地址
  view: PropTypes.string, // 浏览量
  onClick: PropTypes.func,
  isEssence: PropTypes.bool, // 是否精华
  isPoster: PropTypes.bool, // 是否海报
  isPay: PropTypes.bool, // 是否付费
  isReward: PropTypes.bool, // 是否悬赏
  isRed: PropTypes.bool, // 是否红包
  isAnonymous: PropTypes.bool, // 是否是匿名贴
  userId: PropTypes.number, // 用户id PC端
  platform: PropTypes.string, // 是否展示pop PC端
  icon: PropTypes.string, // 图标：点赞或者是付费用户
  collect: PropTypes.string,
  unifyOnClick: PropTypes.func,
  extraTag: PropTypes.element,
};

export default function UserInfo(props) {
/*  useEffect(() => {
    // 使用浏览器的 API 更新页面标题
    console.log(props)
  });*/
  let tagsNumber = 0;

  props.isEssence && (tagsNumber = tagsNumber + 1);
  props.isPay && (tagsNumber = tagsNumber + 1);
  props.isReward && (tagsNumber = tagsNumber + 1);
  props.isRed && (tagsNumber = tagsNumber + 1);
  // 是否显示用户组弹框
  const [showShipCard, setShowShipCard] = useState(false);

  const isPc = props.platform === 'pc';
  const router = useRouter();
  return (
    <>
      <SiteMapLink href={`/user/${props.userId}`} text={props.name || ''}/>
      <div className={styles.contianer}>
        <Avatar
          isShowUserInfo={!props.hideInfoPopip && props.platform === 'pc'}
          userId={props.userId}
          className={classNames(styles.avatar, styles.cursor)}
          circle={true}
          image={props.avatar}
          name={props.name || ''}
          onClick={e => props.onClick && props.onClick(e)}
          unifyOnClick={props.unifyOnClick}
          platform={props.platform}
        ></Avatar>

        <div className={styles.right}>
          <div className={styles.info}>
            <div className={classNames(styles.name, props.platform === 'pc' && styles.pc, styles.cursor)} onClick={e => props.onClick(e)}>{props.name}</div>
            {
            !props.isAnonymous && props.groupName &&
            <div className={styles.groupNameBox}>
              {
                props.groupLevel ?
                <MemberBadge
                  onClick={() => {
                    isPc ? setShowShipCard(true) : router.push(`/my/upgrade?level=${props.groupLevel}`);
                  } }
                  groupLevel={props.groupLevel}
                  groupName={props.groupName}
                  groupNameStyle={tagsNumber < 3 ? {maxWidth: '82.5px'} : {maxWidth: '58px'}}
                />
                :
                <div className={`${styles.groupName} ${tagsNumber > 3 ? styles.groupNameText : ''}`}>{props.groupName}</div>
              }
            </div>
          }
            {props.extraInfo && props.extraInfo}
          </div>

          <div className={styles.meta}>
            {props.time && <span className={styles.time}>{props.time.substr(0, 10)}</span>}
            {props.location && (
              <div className={styles.location}>
                <Icon name="PositionOutlined" size={14}></Icon>
                <span>{props.location}</span>
              </div>
            )}
            {props.view && (
              <div className={styles.view}>
                <Icon name="EyeOutlined" className={styles.viewIcon} size={14}></Icon>
                <span>{props.view}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.tags}>
          {props.isEssence && <Tag type="orange">{tagsNumber > 2 && !isPc ? '精' : '精华'}</Tag>}
          {/* {props.isEssence && <Tag type="primary">精华</Tag>} */}
          {props.isReward && <Tag type="warning">{tagsNumber > 2 && !isPc ? '悬' : '悬赏'}</Tag>}
          {props.isRed && <Tag type="danger">{tagsNumber > 2 && !isPc ? '红' : '红包'}</Tag>}
          {props.isPay && <Tag type="success">{tagsNumber > 2 && !isPc ? '付' : '付费'}</Tag>}
          {/* {props.collect === 'collect' || true &&  <Icon className={styles.listItemIcon} name='CollectOutlined' size={20} />} */}
          {props.extraTag && props.extraTag}
        </div>
        {showShipCard && (
          <MemberShipCard
            showRenderCard={false}
            visible={showShipCard}
            onClose={() => setShowShipCard(false)}
            groupLevel={props.groupLevel}
            groupName={props.groupName}
          />
        )}
      </div>
    </>
  );
}
