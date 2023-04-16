import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import UserCenterEditHeader from '../user-center-edit-header';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import { inject, observer } from 'mobx-react';
import throttle from '@common/utils/thottle.js';
import { View, Text } from '@tarojs/components';
import { isExtFieldsOpen } from '@common/store/login/util';

@inject('site')
@inject('user')
@observer
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isClickNickName: false,
      isConfirm: false, // 是否点击保存
    };
    this.user = this.props.user || {};
    Taro.hideShareMenu();
  }

  setNavigationBarStyle = () => {
    Taro.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#ffffff',
    });
  };

  initState = () => {
    this.setState({
      isClickNickName: false,
      isConfirm: false,
    });
  };

  async componentDidMount() {
    this.setNavigationBarStyle();
    this.initState();
    const id = this.props.user?.id;
    await this.props.user.updateUserInfo(id);
    await this.props.user.initEditInfo();
  }

  // 点击取消
  handleCancel = throttle(() => {
    Taro.navigateBack();
    this.props.user.initEditInfo();
    this.initState();
  }, 300);

  handleClickNickName = () => {
    this.setState({
      isClickNickName: !this.state.isClickNickName,
    });
  };

  handleChangeNickName = (e) => {
    const { value } = e.target;
    this.props.user.editNickName = value;

  };

  handleInputNickName = (e) => {
    const { value } = e.detail;
    this.props.user.editNickName = value;
  };

  handleBlurNickName = (e) => {
    const { value } = e.target;
    this.props.user.editNickName = value;
    this.setState({
      isClickNickName: false,
    });
  };

  handleUpdateEditedUserInfo = throttle(() => {
    if (this.state.isConfirm) return;
    this.setState({
      isConfirm: true,
    });
    this.props.user
      .updateEditedUserInfo()
      .then((res) => {
        Toast.success({
          content: '更新信息成功',
          hasMask: false,
          duration: 1000,
        });
        this.initState();
        setTimeout(() => {
          Taro.navigateBack();
        }, 300);
      })
      .catch((error) => {
        Toast.error({
          content: error.Message || '更新用户信息失败',
          hasMask: false,
          duration: 1000,
        });
        this.initState();
        setTimeout(() => {
          Taro.navigateBack();
        }, 300);
      });
  }, 300);

  handleGoToEditMobile = () => {
    if (!this.user.mobile) {
      Taro.navigateTo({ url: '/userPages/user/bind-phone/index?from=userCenter' });
      return;
    }
    Taro.navigateTo({ url: '/userPages/my/edit/mobile/index' });
  };

  handleGoToEditUserName = () => {
    if (!this.props.user.canEditUsername) {
      Toast.error({
        content: '暂无法修改（一年一次）',
        duration: 2000,
      });
      return;
    }
    Taro.navigateTo({ url: '/userPages/my/edit/username/index' });
  };

  handleGoToEditAccountPwd = () => {
    Taro.navigateTo({ url: '/userPages/my/edit/pwd/index' });
  };

  handleGoToEditPayPwd = () => {
    Taro.navigateTo({ url: '/userPages/my/edit/paypwd/index' });
  };

  handleGoToAdditionalInfo = () => {
    Taro.navigateTo({ url: '/userPages/my/edit/additional-info/index' });
  };

  // 渲染修改用户名
  renderInputNickName = () => {
    const { isClickNickName } = this.state;
    return (
      <View className={styles.userCenterEditLabel} style={{ overflow: 'hidden' }}>
        <Text className={styles.userLabelName}>昵称</Text>
        <View className={styles.uerInputItem}>
          {isClickNickName ? (
            <Input
              focus
              maxLength={10}
              value={this.user.editNickName}
              miniType="nickname"
              onInput={this.handleInputNickName}
              onChange={this.handleChangeNickName}
              onBlur={this.handleBlurNickName}
            />
          ) : (
            this.user.editNickName
          )}
        </View>
      </View>
    );
  };

  render() {
    const { isConfirm } = this.state;
    const { user, site } = this.props;
    // 条件都满足时才显示微信
    const IS_WECHAT_ACCESSABLE = this.props.site.wechatEnv !== 'none' && !!this.user.wxNickname;
    const ISEXT_FIELD_OPENS = isExtFieldsOpen(this.props?.site);
    return (
      <View className={styles.userCenterWrapper}>
        {/* 头部 */}
        <View>
          <UserCenterEditHeader />
        </View>
        {/* middle */}
        <View className={styles.userCenterEditMiddle}>
          <View className={styles.title}>个人信息</View>
          <View onClick={this.handleClickNickName} className={styles.userInputContent}>
            {this.renderInputNickName()}
          </View>
          <View className={styles.userCenterEditItem}>
            <View className={styles.userCenterEditLabel}>
              <Text className={styles.userLabelName}>用户名</Text>
            </View>
            <View className={styles.userCenterEditValue} onClick={this.handleGoToEditUserName}>
              <View className={styles.ucText}>{this.user.username}</View>
              <Icon name="RightOutlined" size={12} />
            </View>
          </View>
          {this.props.site?.isSmsOpen && (
            <View className={styles.userCenterEditItem}>
              <View className={styles.userCenterEditLabel}>
                <Text className={styles.userLabelName}>手机号码</Text>
              </View>
              <View className={styles.userCenterEditValue} onClick={this.handleGoToEditMobile}>
                <View className={styles.ucText}>{this.user.mobile || '去绑定'}</View>
                <Icon name="RightOutlined" size={12} />
              </View>
            </View>
          )}
          <View className={styles.userCenterEditItem}>
            <View className={styles.userCenterEditLabel}>
              <Text className={styles.userLabelName}>账户密码</Text>
            </View>
            <View className={styles.userCenterEditValue} onClick={this.handleGoToEditAccountPwd}>
              <View className={styles.ucText}>{this.props.user?.hasPassword ? '修改' : '设置'}</View>
              <Icon name="RightOutlined" size={12} />
            </View>
          </View>
          <View className={styles.userCenterEditItem}>
            <View className={styles.userCenterEditLabel}>
              <Text className={styles.userLabelName}>支付密码</Text>
            </View>
            <View className={styles.userCenterEditValue} onClick={this.handleGoToEditPayPwd}>
              <View className={styles.ucText}>{this.props.user?.canWalletPay ? '修改' : '设置'}</View>
              <Icon name="RightOutlined" size={12} />
            </View>
          </View>
          {IS_WECHAT_ACCESSABLE && (
            <View className={styles.userCenterEditItem}>
              <View className={styles.userCenterEditLabel}>
                <Text className={styles.userLabelName}>微信</Text>
                <View className={styles.userCenterEditWeChat}>
                  <Avatar size="small" image={this.user.wxHeadImgUrl} name={this.user.wxNickname} />
                  <Text className={styles.wxNickname}>{this.user.wxNickname}</Text>
                  <Text className={styles.linkText} onClick={() => {
                    Taro.navigateTo({ url: '/userPages/user/rebind/index' });
                  }}
                  >换绑</Text>
                </View>
              </View>
            </View>
          )}
          {ISEXT_FIELD_OPENS && (
            <View className={styles.userCenterEditItem} onClick={this.handleGoToAdditionalInfo}>
              <View className={styles.userCenterEditLabel}>
                <Text className={styles.userLabelName}>补充信息</Text>
              </View>
              <View className={styles.userCenterEditValue}>
                <Icon name="RightOutlined" size={12} />
              </View>
            </View>
          )}
        </View>
        {/* bottom */}
        <View className={styles.userCenterEditBtn}>
          <Button full onClick={this.handleCancel} className={styles.btn}>
            取消
          </Button>
          <Button
            full
            className={styles.btn}
            onClick={this.handleUpdateEditedUserInfo}
            type="primary"
            disabled={isConfirm}
          >
            {isConfirm ? <Spin type="spinner">保存中...</Spin> : '保存'}
          </Button>
        </View>
      </View>
    );
  }
}

export default index;
