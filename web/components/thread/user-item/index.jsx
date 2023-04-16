import React, { useContext } from 'react';
import { Button, Icon } from '@discuzqsdk/design';
import Avatar from '../../avatar';
import { noop } from '../utils';
import styles from './index.module.scss';
import { ThreadCommonContext } from '../utils'
import classNames from 'classnames';
import MemberBadge from '@components/member-badge';

const attachInfo = {
  name: '姓名',
  mobile: '手机号',
  weixin: '微信号',
  address: '联系地址',
};

/**
 * 用户信息视图
 * @prop {string}  imgSrc 用户头像
 * @prop {string}  title 用户名字
 * @prop {number}  type 免费还是付费用户
 * @prop {string}  subTitle 额外信息
 * @prop {string}  icon 用户头像右下角图标
 * @prop {string}  label 额外信息
 * @prop {string}  onClick 点击事件
 * @prop {string}  isShowBottomLine 是否显示分割线
 */
// TODO 点击穿透问题之后想办法解决
const Index = ({
  imgSrc,
  title = '',
  type = 0,
  subTitle,
  label,
  groupLevel,
  index,
  onClick = noop,
  userId,
  platform,
  itemStyle = {},
  className = '',
  additionalInfo = {}, // 报名帖的额外字段信息
}) => {

  const handleClick = (e) => {
    e.stopPropagation();
    const avatarPopup = e?.currentTarget.querySelector("#avatar-popup");
    if (e && avatarPopup && avatarPopup.contains(e.target)) { // 处理来源于Avatar弹框的点击
      return;
    }
    onClick(userId);
  };

  const classString = `${styles.listItem} ${className}`;
  const isHaveAdditionalInfo = Object.keys(additionalInfo || {}).length > 0;

  return (
    <div className={classNames(classString.trim(), {
      [styles.additional]: isHaveAdditionalInfo,
    })} key={index} style={itemStyle} onClick={isHaveAdditionalInfo ? noop : handleClick}>
      {isHaveAdditionalInfo && index === 0 && (
        <div className={styles['additional-wrapper']}>
          <div className={styles['additional-user']}>
            用户
          </div>
          <div className={styles['additional-right']}>
            {Object.keys(additionalInfo || {}).map((item, ind) => (
              <div className={styles['additional-name']} key={ind}>
                {attachInfo[item]}
              </div>
            ))}
          </div>
        </div>
      )}
      {isHaveAdditionalInfo && (
        <div className={styles['additional-wrapper']}>
          <div className={styles['additional-user']} onClick={handleClick}>
            <Avatar
              className={styles.img}
              image={imgSrc}
              name={title}
              isShowUserInfo={platform === 'pc'}
              userId={userId}
              userType={type}
            />
            <span className={styles.title}>{title}</span>
          </div>
          <div className={classNames(styles['additional-right'], styles['additional-scrollX'])}>
            {Object.keys(additionalInfo || {}).map((item, key) => (
              <div className={styles['additional-item']} key={key}>
                {additionalInfo[item]}
              </div>
            ))}
          </div>
        </div>
      )}
      {!isHaveAdditionalInfo && <>
      <div className={styles.wrapper}>
          <div className={styles.header}>
              <Avatar
                className={styles.img}
                image={imgSrc}
                name={title}
                isShowUserInfo={platform === 'pc'}
                userId={userId}
                userType={type}
              />
          </div>

          <div className={styles.content}>
              <span className={styles.title}>{title}</span>
              {subTitle && <span className={styles.subTitle}>{subTitle}</span>}
          </div>
      </div>

      {
        label || label === '' ? (
          <div className={styles.footer}>
            {
              groupLevel ? 
              <MemberBadge
                groupLevel={groupLevel}
                groupName={label}
                memberBadgeStyle={{marginRight: '7px'}}
              />
              :
              <span className={styles.label}>{label}</span>
            }
            <Icon className={styles.rightIcon} name="RightOutlined" size={12} />
          </div>
        ) : (
          <Button type="primary" className={styles.button} onClick={handleClick}><span>查看主页</span></Button>
        )
      }
      </>}
    </div>
  );
};

export default React.memo(Index);
