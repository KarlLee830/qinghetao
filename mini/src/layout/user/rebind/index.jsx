import React, { Component } from 'react';
import { View } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import Page from '@components/page';
import HomeHeader from '@components/home-header';
import styles from './index.module.scss';

@inject('site')
@observer
class Rebind extends Component {
  constructor(props) {
    super(props);
    this.state = {
      explain: [
        '电脑登录站点',
        '进入个人中心-编辑资料-微信换绑',
        '手机登录新微信扫码完成换绑'
      ],
    };

    this.timer = null;
    this.isDestroy = false;
  }

  render() {
    const { explain } = this.state;

    return (
      <Page>
        <HomeHeader hideInfo hideMinibar mode="supplementary"/>
        <View className={styles.container}>
          <View className={styles.content}>
            <View className={styles.title}>换绑流程说明</View>
            {
              explain.map((item, index) => (
                <View key={index} className={styles.rebind_explain_list}>
                  <View className={styles.rebind_explain_index}>{index + 1}</View>
                  <View className={styles.rebind_explain_value}>{item}</View>
                </View>
              ))
            }
          </View>
        </View>
      </Page>
    );
  }
}

export default Rebind;
