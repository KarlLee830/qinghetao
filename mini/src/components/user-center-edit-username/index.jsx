import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Taro from '@tarojs/taro';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import styles from './index.module.scss';
import { View } from '@tarojs/components';

@inject('user')
@observer
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmit: false, // 是否点击提交
    };
  }

  initState = () => {
    this.setState({
      isSubmit: false,
    });
  };

  handleChangeNewUserName = (e) => {
    if (e.target.value){
      this.props.user.editUserName = e.target.value;
    }
  };

  handleInputNickName = (e) => {
    const { value } = e.detail;
    this.props.user.editUserName = value;
  };

  handleSubmit = async () => {
    try {
      this.setState({
        isSubmit: true,
      });
      await this.props.user.updateUsername();
      Toast.success({
        content: '修改用户名成功',
        duration: 2000,
      });
      this.props.user.userInfo.username = this.props.user.editUserName;
      setTimeout(() => {
        Taro.navigateTo({ url: '/userPages/my/index' });
        this.initState();
      }, 1000);
    } catch (err) {
      if (err.Code) {
        Toast.error({
          content: err.Msg || '修改失败',
          duration: 2000,
        });
        this.initState();
      }
    }
  };

  render() {
    const { user } = this.props;
    const { editUserName } = user;
    const { isSubmit } = this.state;
    return (
      <View id={styles.resetUserName}>
        <View className={styles.content}>
          <View className={styles.setTitle}>设置新用户名</View>
          <View className={styles.labelInfo}>
            <View className={styles.labelValue}>
              <Input
                value={editUserName}
                miniType="nickname"
                onInput={this.handleInputNickName}
                onChange={this.handleChangeNewUserName}
                placeholder="请输入新用户名"
                maxLength={30}
                trim
              />
            </View>
          </View>
        </View>
        <View className={styles.bottom}>
          <Button
            disabled={!editUserName || isSubmit}
            full
            onClick={this.handleSubmit}
            type={'primary'}
            className={styles.btn}
          >
            {isSubmit ? <Spin type="spinner">提交中...</Spin> : '提交'}
          </Button>
        </View>
      </View>
    );
  }
}
