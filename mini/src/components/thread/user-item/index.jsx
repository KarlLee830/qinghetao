import React, { useContext } from 'react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Avatar from '../../avatar';
import { noop } from '../utils';
import styles from './index.module.scss';
import { ThreadCommonContext } from '../utils'
import { View, Text, ScrollView } from '@tarojs/components'
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
    onClick(userId);
  };

  const icon =  (type === 1) ? "LikeOutlined" :
                (type === 2) ? "HeartOutlined" :
                (type === 3) ? "HeartOutlined" : "",
        bgClrBasedOnType =  (type === 1) ? styles.like :
                            (type === 2) ? styles.heart :
                            (type === 3) ? styles.heart : "";

  const classString = `${styles.listItem} ${className}`;
  const isHaveAdditionalInfo = Object.keys(additionalInfo || {}).length > 0;
  return (
    <View className={classNames(classString.trim(), {
      [styles.additional]: isHaveAdditionalInfo,
    })} key={index} onClick={handleClick} style={itemStyle}>
      {isHaveAdditionalInfo && index === 0 && (
        <View className={styles['additional-wrapper']}>
          <View className={styles['additional-user']}>
            用户
          </View>
          <View className={styles['additional-right']}>
            {Object.keys(additionalInfo || {}).map((item, ind) => (
              <View className={styles['additional-name']} key={ind}>
                {attachInfo[item]}
              </View>
            ))}
          </View>
        </View>
      )}
      {isHaveAdditionalInfo && (
        <View className={styles['additional-wrapper']}>
          <View className={styles['additional-user']} onClick={handleClick}>
            <Avatar
              wrapperClass={styles['img-wrapper']}
              className={styles.img}
              image={imgSrc}
              name={title}
              isShowUserInfo={platform === 'pc'}
              userId={userId}
              userType={type}
            />
            <View className={styles.title}>{title}</View>
          </View>
          <View className={styles['additional-right']}>
            <ScrollView scrollX>
              {Object.keys(additionalInfo || {}).map((item, key) => (
                <View className={styles['additional-item']} key={key}>
                  {additionalInfo[item]}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
      {!isHaveAdditionalInfo && <>
      <View className={styles.wrapper}>
          <View className={styles.header}>
              <Avatar
                className={styles.img}
                image={imgSrc}
                name={title}
                isShowUserInfo={platform === 'pc'}
                userId={userId}
              />
              {
                icon && (
                  <View className={`${styles.icon} ${bgClrBasedOnType}`}>
                      <Icon name={icon} size={12}/>
                  </View>
                )
              }
          </View>

          <View className={styles.content}>
              <Text className={styles.title}>{title}</Text>
              {subTitle && <Text className={styles.subTitle}>{subTitle}</Text>}
          </View>
      </View>

      {
        label || label === '' ? (
          <View className={styles.footer}>
            {
              groupLevel ?
              <MemberBadge
                groupLevel={groupLevel}
                groupName={label}
                memberBadgeStyle={{marginRight: '7px'}}
              />
              :
              <Text className={styles.label}>{label}</Text>
            }
            <Icon className={styles.rightIcon} name="RightOutlined" size={12} />
          </View>
        ) : (
          <Button type="primary" className={styles.button} onClick={handleClick}>查看主页</Button>
        )
      }
      </>}
    </View>
  );
};

export default React.memo(Index);
