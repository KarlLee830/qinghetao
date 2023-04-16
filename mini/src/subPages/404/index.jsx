import React, { Component } from 'react';
import Router from '@discuzqsdk/sdk/dist/router'
import { View, Text, Image } from '@tarojs/components';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Page from '@components/page';
import { IMG_SRC_HOST } from '@common/constants/site';
import styles from './index.module.scss';
// import img404 from '../../../../web/public/dzq-img/404.png';
import Taro from '@tarojs/taro';

const img404 = `${IMG_SRC_HOST}/assets/404.c57a3a41feb16d1530344c8b1f258e0db5e298f9.png`;

class NotFindPage extends Component {
  componentWillMount() { }

  componentDidMount() { }

  componentWillUnmount() { }

  componentDidShow() { }

  componentDidHide() { }

  goback() {
    const pages = Taro.getCurrentPages();
    if (pages.length === 1) {
      Router.redirect({
        url: '/indexPages/home/index'
      });
    } else {
      Router.back()
    }
  }

  render() {
    return (
      <Page>
        <View className={styles.page}>
          <Image className={styles.img} src={img404} />
          <Text className={styles.text}>您要访问的页面可能已被删除、已更改名称或暂时不可用</Text>
          <View className={styles.fixedBox}>
            <Button onClick={() => {this.goback()}} size='large' className={styles.btn} type='primary'>返回上一页</Button>
          </View>
        </View>
      </Page>
    );
  }
}

export default NotFindPage;
