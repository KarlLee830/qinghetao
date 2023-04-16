import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import { observer, inject } from 'mobx-react';
import classNames from 'classnames';
import styles from './index.module.scss';

import DateTimePicker from '../date-time-picker';
import { getDate } from '../date-time-picker/utils';

@inject('threadPost')
@observer
class RewardQa extends Component {
  constructor() {
    super();
    this.state = {
      money: '', // 悬赏金额
      times: getDate(Date.now() + 1 * 25 * 60 * 60 * 1000), // 悬赏时间
      initValue: Date.now() + 1 * 25 * 60 * 60 * 1000, // 时间选择框初始值
    };
    this.timeRef = React.createRef();
  }

  componentDidMount() { // 回显悬赏信息
    const { rewardQa: { value, times } } = this.props.threadPost.postData;
    value && times && this.setState({
      money: value,
      times: times,
    })
  }

  onMoneyChang = (val) => { // 处理悬赏金额输入
    const arr = val.match(/([1-9]\d{0,6}|0)(\.\d{0,2})?/);
    this.setState({ money: arr ? arr[0] : '' })
  }

  openTimePicker = () => { // 开启时间选择框
    const { openModal } = this.timeRef.current;
    openModal(this.state.times);
  }

  onConfirm = (val) => { // 监听时间选中
    this.setState({
      times: val
    });
  };

  handleCancel = () => { // 取消悬赏
    Taro.navigateBack();
  }

  handleConfirm = () => { // 确认悬赏
    if (this.checkMoney() && this.checkTime()) {
      // 更新store
      const { money, times } = this.state;
      const { setPostData } = this.props.threadPost;
      setPostData({
        rewardQa: {
          value: parseFloat(money),
          times: times,
        }
      })
      // 返回上一页
      Taro.navigateBack();
    }

  }

  checkMoney = () => {
    const { money } = this.state;
    if (!money) {
      Taro.showToast({
        title: '请选择悬赏金额',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    if (parseFloat(money) < 0.1 || parseFloat(money) > 1000000) {
      Taro.showToast({
        title: '可选悬赏金额为0.1 ~ 1000000元',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    return true;
  }

  checkTime = () => {
    const { times } = this.state;
    if (!times) {
      Taro.showToast({
        title: '请选择悬赏时间',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    const selectTime = (new Date(times)).getTime();
    const diffTime = selectTime - Date.now();
    if (diffTime < 86400000) {
      Taro.showToast({
        title: '悬赏时间需要大于一天',
        icon: 'none',
        duration: 2000
      })
      return false;
    }
    return true;
  }

  render() {
    const { money, times } = this.state;

    return (
      <View className={styles.wrapper}>
        {/* 悬赏金额 */}
        <View className={styles['reward-item']}>
          <Text className={styles['reward-text']}>悬赏金额</Text>
          <View className={styles['reward-money']}>
            <Input
              value={money}
              mode="number"
              miniType="digit"
              placeholder="金额"
              maxLength={10}
              onChange={e => this.onMoneyChang(e.target.value)}
            />元
          </View>
        </View>
        {/* 悬赏结束时间 */}
        <View className={styles['reward-item']}>
          <Text className={styles['reward-text']}>悬赏结束时间</Text>
          <View className={styles['reward-time']}>
            <View
              className={classNames(
                styles['selected-time'],
                !times && styles['default-time']
              )}
              onClick={this.openTimePicker}
            >
              {times || '请选择悬赏时间'}
            </View>
            <View className={styles['time-arrow']}>
              <Icon name="RightOutlined" size={10} />
            </View>
          </View>
        </View>
        {/* 按钮 */}
        <View className={styles.btn}>
          <Button onClick={this.handleCancel}>取消</Button>
          <Button className={styles['btn-confirm']} onClick={this.handleConfirm}>确定</Button>
        </View>
        {/* 时间选择弹框 */}
        <DateTimePicker
          ref={this.timeRef}
          onConfirm={this.onConfirm}
          initValue={this.state.initValue}
          wrap-class="my-class"
          select-item-class="mySelector"
        />

      </View>
    );
  }
}

export default RewardQa;
