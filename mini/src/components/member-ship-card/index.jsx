import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import { Button, Dialog, Tabs } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import time from '@discuzqsdk/sdk/dist/time';
import { payGroupLevelStyle as levelStyle } from '@common/constants/const';
import groupPay from '@common/pay-bussiness/group-pay';
import classnames from 'classnames';
import Header from '@components/header';
import Router from '@discuzqsdk/sdk/dist/router';

const MemberShipCard = ({ site, user, onRenewalFeeClick, shipCardClassName }) => {
  const { siteMode, isPC, webConfig } = site;
  const { userInfo, paid, isAdmini, isIndefiniteDuration, expiredDays, expiredAt, payGroups } = user;
  const { group = {} } = userInfo || {};
  const { level, remainDays, expirationTime, groupName, description, isTop, hasPayGroup, amount, groupId, typeTime, remainTime } = group;

  const theme = levelStyle[level] || {};
  const isPaySite = siteMode === 'pay';

  // 获取付费用户组数据
  useEffect(() => {
    user.queryPayGroups();
  }, []);

  // 打开升级付费用户组的弹窗
  const handlePayGroupRenewal = (upgradeLevel) => {
    Router.push({url: `/userPages/my/upgrade/index?level=${upgradeLevel}`});
  };

  // 处理付费站点续费
  const handleRenewalFee = () => {
    typeof onRenewalFeeClick === 'function' && onRenewalFeeClick();
  };

  // 执行付费
  const doPay = async ({ amount, groupId, title }) => {
    try {
      await groupPay({ amount, groupId, title, user, site });
    } catch (error) {}
  };

  // 获取日期格式
  const getDateFormat = () => {
    if (time.isCurrentYear(expiredAt)) {
      return 'MM月DD日';
    } else {
      return 'YYYY年MM月DD日';
    }
  };

  const renderFeeDateContent = () => {
    const typeMap = {
      0: '天',
      1: '时',
      2: '分',
    };
    // 付费用户组用户
    if (level > 0) {
      return (
        <>
          <View className={styles.feeDayContainer}>
            <Text className={styles.feeDay} style={{color: theme.otherColor}}>{remainTime}</Text>
            <Text style={{color: theme.desAndDateColor}}>{typeMap[typeTime]}</Text>
          </View>
          <Text style={{color: theme.desAndDateColor}}>{time.formatDate(expirationTime, getDateFormat())}到期</Text>
        </>
      );
    }

    // 付费站点用户
    if (isPaySite && paid) {
      if (expiredDays === 0) {
        return (
          <>
            <Text className={styles.feeDay}>0</Text>天
          </>
        );
      } else if (isIndefiniteDuration) {
        return <Text className={styles.noTimeDate}>无限期</Text>;
      } else {
        return (
          <>
            <View className={styles.feeDayContainer}>
              <Text className={styles.feeDay}>{expiredDays}</Text>天
            </View>
            <Text style={{color: theme.desAndDateColor}}>{time.formatDate(expiredAt, getDateFormat())}到期</Text>
          </>
        );
      }
    }
  };

  const renderButton = () => {
    const leftBtnStyle = {
      backgroundColor: theme.otherColor,
      borderColor: theme.otherColor,
      color: theme.leftBtnTextColor,
    };
    const rightBtnStyle = {
      marginLeft: '8px',
      backgroundColor: theme.rightBtnBgColor,
      borderColor: theme.otherColor,
      color: theme.otherColor,
    };

    // 付费用户组用户
    if (level > 0) {
      return (
        <>
          <Button onClick={() => doPay({amount, title: '付费用户组续费', groupId })} type="primary" className={styles.btn} style={leftBtnStyle}>续费</Button>
          {!isTop && <Button onClick={() => {handlePayGroupRenewal(level + 1)}} type="primary" className={styles.btn} style={rightBtnStyle}>升级</Button>}
        </>
      );
    }

    const upgrade = (<Button onClick={() => {handlePayGroupRenewal(level + 1)}} type="primary" className={styles.btn}>升级</Button>);

    // 付费站点用户
    if (isPaySite && paid && !isIndefiniteDuration) {
      return (
        <>
          <Button onClick={handleRenewalFee} type="primary" className={styles.btn} style={{marginRight: '12px'}}>续费</Button>
          {hasPayGroup && upgrade}
        </>
      );
    }

    // 普通用户且后台设置了付费用户组
    if (hasPayGroup) {
      return upgrade;
    }
  };

  const renderCard = (data, noBtn = false) => {
    const { groupName, level, description } = data;
    const theme = levelStyle[level] || {};
    return (
      <View className={`${styles.memberShipCardWrapper} ${shipCardClassName}`} style={{backgroundImage: `url(${theme.bgImg})`}}>
        <View className={styles.MemberShipCardContent}>
          <View className={styles.roleType} style={{color: theme.groupNameColor}}>{groupName}</View>
          <View className={styles.tagline} style={{color: theme.desAndDateColor}}>{level > 0 ? description : '访问海量站点内容'}</View>
          <View className={styles.RenewalFee} style={{visibility: noBtn ? 'hidden' : 'visible'}}>
            {webConfig?.other?.threadOptimize && renderButton()}
            <View className={styles.feeTimer}>{renderFeeDateContent()}</View>
          </View>
        </View>
      </View>
    );
  };

  return isAdmini ? null : (
    <View className={styles.wrapper}>
      {renderCard({groupName, level, description})}
    </View>
  );

};

export default inject('site', 'user')(observer(MemberShipCard));
