import React, { Component } from 'react';
import { getCurrentInstance, redirectTo } from '@tarojs/taro';
import { View, Image, Text } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
// import Button from '@discuzqsdk/design/dist/components/button/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Page from '@components/page';
import layout from './index.module.scss';
import clearLoginStatus from '@common/utils/clear-login-status';
import Router from '@discuzqsdk/sdk/dist/router';

@inject('user')
@inject('site')
@inject('commonLogin')
@observer
class Index extends Component {
  componentWillMount() { }

  componentDidMount() {
    // TODO: 暂时取消倒计时跳转首页
    this.props.commonLogin.setStatusCountDown(0);
    // const { commonLogin } = this.props;
    // const { statusCode } = getCurrentInstance().router.params;
    // if (statusCode === '2') {
    //   this.timer = setInterval(() => {
    //     if (commonLogin.statusCountDown === 0) {
    //       redirectTo({
    //         url: `/indexPages/home/index`
    //       });
    //       clearInterval(this.timer);
    //       return;
    //     }
    //     commonLogin.setStatusCountDown(commonLogin.statusCountDown - 1);
    //   }, 1000)
    // }
  }

  componentWillUnmount() {
    // this.props.commonLogin.setStatusCountDown(5);
    // clearInterval(this.timer);
  }

  componentDidShow() { }

  componentDidHide() { }

  logout() {
    clearLoginStatus();
    this.props.user.removeUserInfo();
    this.props.site.getSiteInfo();
    Router.reLaunch({ url: '/indexPages/home/index' });
  }

  gotoIndex() {
    redirectTo({
      url: `/indexPages/home/index`
    });
  }

  operBtnAction() {
    const { statusCode } = getCurrentInstance().router.params;
    statusCode === '2' ? this.gotoIndex() : this.logout();
  }

  render() {
    const { commonLogin } = this.props;
    const { statusCode, statusMsg } = getCurrentInstance().router.params;

    return (
      <Page>
        <View className={layout.container}>
          <View className={layout.content}>
            <View className={layout.icon}>
              <Image className={layout.icon__img} src='https://gimg2.baidu.com/image_search/src=http%3A%2F%2Fcdn.duitang.com%2Fuploads%2Fitem%2F201408%2F30%2F20140830180834_XuWYJ.png&refer=http%3A%2F%2Fcdn.duitang.com&app=2002&size=f9999,10000&q=a80&n=0&g=0n&fmt=jpeg?sec=1620908425&t=673ddda42973b103faf179fc02818b41' alt=""/>
            </View>
            <View className={layout.functionalRegion}>
                { statusCode === '2'
                  ? (
                    <><View>恭喜您！已成功登录。</View><View>先随便逛逛等待账号审核通过！</View></>
                  )
                  : (<Text>{commonLogin.statusMessage || (statusCode && commonLogin.setStatusMessage(statusCode, statusMsg))}</Text>)
                }
            </View>
            <Button className={layout.button} type="primary" onClick={() => {this.operBtnAction()}}>
              {
                statusCode === '2'
                  ? `跳转到首页${commonLogin.statusCountDown ? `（倒计时 ${commonLogin.statusCountDown} s）` : ''}`
                  : '退出登录'
              }
            </Button>
          </View>
        </View>
      </Page>
    );
  }
}

export default Index;
