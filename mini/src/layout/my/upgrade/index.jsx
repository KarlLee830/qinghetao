import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Tabs from '@discuzqsdk/design/dist/components/tabs/index';
import { inject, observer } from 'mobx-react';
import { payGroupLevelStyle as levelStyle } from '@common/constants/const';
import groupPay from '@common/pay-bussiness/group-pay';
import classnames from 'classnames';
import Taro from '@tarojs/taro';
import Router from '@discuzqsdk/sdk/dist/router';

const Index = ({ site, user, shipCardClassName }) => {
  const { userInfo, payGroups, } = user;
  const { group = {} } = userInfo || {};

  const [defaultActive, setDefaultActive] = useState(1);

  useEffect(async () => {
    await user.queryPayGroups();
    const { level = 1 } = Taro.getCurrentInstance().router.params;
    setDefaultActive(Number(level) || 1);
  }, []);

  // 执行付费
  const doPay = async ({ amount, groupId, title }) => {
    try {
      await groupPay({ amount, groupId, title, user, site });
      Router.back();
    } catch (error) {
      console.log(error);
    }
  };

  const renderCard = (data) => {
    const { groupName, level, description } = data;
    const theme = levelStyle[level] || {};
    return (
      <View className={`${styles.memberShipCardWrapper} ${shipCardClassName}`} style={{backgroundImage: `url(${theme.bgImg})`}}>
        <View className={styles.MemberShipCardContent}>
          <View className={styles.roleType} style={{color: theme.groupNameColor}}>{groupName}</View>
          <View className={styles.tagline} style={{color: theme.desAndDateColor}}>{level > 0 ? description : '访问海量站点内容'}</View>
        </View>
      </View>
    );
  };

  return (
    <View className={styles.wrapper}>
      <Tabs scrollable swipeable activeId={defaultActive} onActive={activeId => setDefaultActive(activeId)}>
        {payGroups.map(({ name: groupName, level, description, fee, notice, amount, groupId, days }) => {
          const data = {
            groupName,
            level,
            description,
          };
          return (
            <Tabs.TabPanel key={level} id={level} label={groupName}>
              <View>
                <View className={classnames(styles.tabPanel, {
                  [styles.mobileTabPanel]: true
                })}>
                  {renderCard(data)}
                  <View className={classnames(styles.operation, {
                    [styles.mobileOperation]: true
                  })}>
                    <View className={styles.top}>
                      <View className={styles.mobileUpgradePrice}>
                        <Text className={styles.symbol}>￥</Text>
                        <Text className={styles.price}>{fee}</Text>
                      </View>
                      <View className={styles.time}>有效期：{`${days}天`}</View>
                    </View>

                    {level > group.level && <Button className={styles.upgradeBtn} style={{margin: 0}} onClick={() => doPay({amount, title: groupName, groupId })}>立即升级</Button>}
                  </View>
                </View>

                <View className={styles.tips} style={{padding: '16px'}}>
                  <View className={styles.title}>购买须知</View>
                  <View className={styles.text}>{notice}</View>
                </View>
              </View>
            </Tabs.TabPanel>
          );
        })}
      </Tabs>
    </View>
  );

};

export default inject('site', 'user')(observer(Index));
