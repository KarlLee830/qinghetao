import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router'
import { View, Text, Image } from '@tarojs/components';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Page from '@components/page';
import { ERROR_PAGE_TIPS, IMG_SRC_HOST } from '@common/constants/site';
import styles from './index.module.scss';
// import imgError from '../../../../web/public/dzq-img/error.png';
const imgError = `${IMG_SRC_HOST}/assets/error.6332cffff6f7fcc0a193a12a7eb74cab05332bba.png`;

@inject('site')
@observer
class SiteError extends Component {
  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  render() {
    const { site: { errPageType = '' } } = this.props;
    return (
      <Page>
      <View className={styles.page}>
        <Image className={styles.img} src={imgError}/>
        <Text className={styles.text}>{ (errPageType && ERROR_PAGE_TIPS[errPageType]) || '未知错误'}</Text>
        <View className={styles.fixedBox}>
          <Button onClick={() => {Router.redirect({url: '/indexPages/home/index'});}} size='large' className={styles.btn} type='primary'>回到首页</Button>
        </View>
      </View>
      </Page>
    );
  }
}

export default SiteError;
