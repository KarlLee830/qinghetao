import React, { Component } from 'react';
import Taro, { getCurrentInstance, redirectTo, navigateTo  } from '@tarojs/taro';
import { View, Text, Navigator } from '@tarojs/components';
import { observer, inject } from 'mobx-react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Avatar from '@discuzqsdk/design/dist/components/avatar/index';
import Page from '@components/page';
import { get } from '@common/utils/get';
import LoginHelper from '@common/utils/login-helper';
import HomeHeader from '@components/home-header';
import styles from './index.module.scss';
import { getParamCode, getUserProfile } from '../../../userPages/user/common/utils';
// const MemoToastProvider = React.memo(ToastProvider);

@inject('site')
@inject('user')
@inject('commonLogin')
@observer
class WXRebindActionPage extends Component {
  constructor(props){
    super(props);
    this.state = {
      currentStatus: '',
      errorTips: '扫码失败',
    };
    this.handleRebindButtonClick = this.handleRebindButtonClick.bind(this);
  }

  async componentDidMount() {
    await getParamCode(this.props.commonLogin);
  }

  componentWillUnmount() {
    this.props.commonLogin.reset();
  }

  getUserProfileCallback = async (params) => {
    const { scene: sessionToken } = getCurrentInstance().router.params;

    try {
      const { user, commonLogin } = this.props;
      await user.rebindWechatMini({
        jsCode: commonLogin.jsCode,
        iv: params.iv,
        encryptedData: params.encryptedData,
        sessionToken,
      });
      this.props.commonLogin.setLoginLoading(true);
      this.setState({
        currentStatus: 'success'
      });
    } catch (e) {
      this.props.commonLogin.setLoginLoading(true);
      await getParamCode(this.props.commonLogin);
      this.setState({
        currentStatus: 'error',
        errorTips: e.Msg
      });
    }
  }

  handleRebindButtonClick() {
    const { commonLogin } = this.props;
    if (!commonLogin.loginLoading) {
      return;
    }
    commonLogin.setLoginLoading(false);
    getUserProfile(this.getUserProfileCallback, true, async () => {
      commonLogin.setLoginLoading(true);
      await getParamCode(this.props.commonLogin);
    });
  }


  render() {
    const { currentStatus, errorTips } = this.state;
    if (currentStatus) {
      return (
        <Page>
          <HomeHeader hideInfo hideMinibar mode="supplementary"/>
          <View className={styles.container}>
            <View className={`${styles.content} ${styles.statusContent}` }>
                { currentStatus === 'success' && <Icon color='#3AC15F' name="SuccessOutlined" size={80} className={styles.statusIcon} /> }
                { currentStatus === 'error' && <Icon color='#E02433' name="WrongOutlined" size={80} className={styles.statusIcon} /> }
                <Text className={styles.statusBottom}>{ currentStatus && (currentStatus === 'success' ? '扫码成功' : '换绑失败') }</Text>
                { currentStatus === 'error' && <Text className={styles.hint}>{errorTips}</Text> }
            </View>
          </View>
        </Page>
      );
    }

    return (
      <Page>
        <HomeHeader hideInfo hideMinibar mode="supplementary"/>
        <View className={styles.container}>
          <View className={styles.content}>
            <View className={styles.title}>确认换绑微信</View>
            <View className={styles.tips}>
              <View>亲爱的用户，确认换绑微信？</View>
            </View>
            <Button
                className={styles.button}
                type="primary"
                onClick={this.handleRebindButtonClick}
              >
              确认
            </Button>
          </View>
        </View>
      </Page>
    );
  }
}

export default WXRebindActionPage;
