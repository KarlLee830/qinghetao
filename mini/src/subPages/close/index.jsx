import React, { Component } from 'react';
import { View, Text, Image  } from '@tarojs/components';
import Page from '@components/page';
import Button from '@discuzqsdk/design/dist/components/button/index';
import { inject, observer } from 'mobx-react';
import { IMG_SRC_HOST } from '@common/constants/site';
import styles from './index.module.scss';
// import imgClose from '../../../../web/public/dzq-img/close.png';
import LoginHelper from '@common/utils/login-helper';

const imgClose = `${IMG_SRC_HOST}/assets/close.ac4a6d7f61eff94e2ed5bf332157fc8828b1a5b2.png`;
@inject('site')
@observer
class Index extends Component {
  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    const { site } = this.props;
    const { closeSiteConfig } = site;
    return (
      <Page>
        <View className={styles.page}>
          <Image className={styles.img} src={imgClose}/>
          <Text className={styles.main}>站点已关闭</Text>
          {closeSiteConfig && <Text className={styles.sub}>{closeSiteConfig.detail}</Text>}
          {/* <View className={styles.fixedBox}>
            <Button onClick={LoginHelper.saveAndLogin} size='large' className={styles.btn} type='primary'>管理员登录</Button>
          </View> */}
        </View>
      </Page>
    );
  }
}

export default Index;
