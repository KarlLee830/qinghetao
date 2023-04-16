import React, { Component } from 'react';
import { View, PickerView, PickerViewColumn } from '@tarojs/components';
import Button from '@discuzqsdk/design/dist/components/button/index';
import styles from './index.module.scss';
import classNames from 'classnames';

import { getPickerViewList, getDate, getArrWithTime, formatDate, getDayList } from './utils';

import PropTypes from 'prop-types';

class DateTimePicker extends Component {
  constructor() {
    super();
    this.state = {
      visible: false, // 是否可见
      current: '', // 当前选择的数据
      dtpInitValue: '', // 初始值
      hasChange: false, // 是否更改
      yearList: [], // 时间选择列表
      monthList: [],
      dayList: [],
      hourList: [],
      minuteList: [],
      selectIndexList: [1, 1, 1, 1, 1], // PickerViewColumn的选择索引
      year: '', // 时间值
      month: '',
      day: '',
      hour: '',
      minute: '',
    };
  }

  componentDidMount() {
    // 初始化默认时间
    const { initValue } = this.props;
    if (!initValue) return;
    const dtpInitValue = getDate(initValue);
    this.setState({ dtpInitValue });
  }

  openModal = (time) => {
    // 根据当前时间初始化时间列表数据
    const { current, dtpInitValue } = this.state;

    const showTime = time ? getDate(time) : dtpInitValue;
    if (time) this.setState({ dtpInitValue: showTime });

    const { yearList, monthList, dayList, hourList, minuteList } = getPickerViewList();
    const arr = getArrWithTime(current || showTime || getDate());
    const [year, month, day, hour, minute] = arr;
    const selectIndexList = [];

    // 获取当前各列表显示索引
    selectIndexList[0] = yearList.indexOf(`${year}年`);
    selectIndexList[1] = monthList.indexOf(`${month}月`);
    selectIndexList[2] = dayList.indexOf(`${day}日`);
    selectIndexList[3] = hourList.indexOf(`${hour}点`);
    selectIndexList[4] = minuteList.indexOf(`${minute}分`);

    // 更新状态
    this.setState({
      visible: true,
      yearList,
      monthList,
      dayList,
      hourList,
      minuteList,
      selectIndexList,
      year,
      month,
      day,
      hour,
      minute,
    });
  };

  // 取消
  handleCancel = () => {
    this.setState({
      visible: false,
      hasChange: false,
    });
    this.props.onCancel();
  };

  // 确定
  handelOk = () => {
    const { year, month, day, hour, minute } = this.state;
    const current = formatDate(year, month, day, hour, minute);

    this.setState({
      visible: false,
      current,
      hasChange: false,
    });

    this.props.onConfirm(current);
  };

  // 监听切换处理函数
  handelChange = (e) => {
    const selectIndexList = e.detail.value;
    const { yearList, monthList, dayList, hourList, minuteList } = this.state;
    const [yearIdx, monthIdx, dayIdx, hourIdx, minuteIdx] = selectIndexList;
    const yearStr = yearList[yearIdx];
    const monthStr = monthList[monthIdx];
    const dayStr = dayList[dayIdx];

    const year = Number(yearStr.substr(0, yearStr.length - 1));
    const month = Number(monthStr.substr(0, monthStr.length - 1));

    // 禁用时间
    if (!this.props.disabledTime) {
      const day = Number(dayStr.substr(0, dayStr.length - 1));
      const hourStr = hourList[hourIdx];
      const minuteStr = minuteList[minuteIdx];
      const hour = Number(hourStr.substr(0, hourStr.length - 1));
      const minute = Number(minuteStr.substr(0, minuteStr.length - 1));
      this.setState({
        hour,
        minute,
        day,
      });
    }

    // 更新年、天数
    const newDayList = getDayList(year, month);

    this.setState({
      hasChange: true,
      dayList: newDayList,
      selectIndexList,
      year,
      month,
    });
  };

  // 清除数据
  clear = () => {
    this.setState({ current: '' });
  };

  render() {
    const { visible, current, yearList, monthList, dayList, hourList, minuteList, selectIndexList } = this.state;

    return (
      visible && (
        <View className={styles.wrapper}>
          <View>
            {/* 背景 */}
            <View className={styles['model-bg']} catchMove></View>
            <View className={styles['model-box']} style={this.props.style}>
              {/* content */}
              <PickerView
                className={classNames(styles['pick-view'], {
                  [styles['pick-view-wallet']]: this.props.type === 'wallet',
                })}
                indicatorStyle="height: 46px"
                value={selectIndexList}
                onChange={this.handelChange}
              >
                {/* 年*/}
                <PickerViewColumn className="picker-view-column">
                  {yearList.length &&
                    yearList.map((item, index) => (
                      <View key={String(index)} className="pick-view-column-item">
                        {item}
                      </View>
                    ))}
                </PickerViewColumn>
                {/* 月*/}
                <PickerViewColumn className="picker-view-column">
                  {monthList.length &&
                    monthList.map((item, index) => (
                      <View key={String(index)} className="pick-view-column-item">
                        {item}
                      </View>
                    ))}
                </PickerViewColumn>
                {/* 日*/}
                {!this.props.disabledTime && (
                  <PickerViewColumn className="picker-view-column">
                    {dayList.length &&
                      dayList.map((item, index) => (
                        <View key={String(index)} className="pick-view-column-item">
                          {item}
                        </View>
                      ))}
                  </PickerViewColumn>
                )}
                {/* 时*/}
                {!this.props.disabledTime && (
                  <PickerViewColumn className="picker-view-column">
                    {hourList.length &&
                      hourList.map((item, index) => (
                        <View key={String(index)} className="pick-view-column-item">
                          {item}
                        </View>
                      ))}
                  </PickerViewColumn>
                )}
                {/* 分*/}
                {!this.props.disabledTime && (
                  <PickerViewColumn className="picker-view-column">
                    {minuteList.length &&
                      minuteList.map((item, index) => (
                        <View key={String(index)} className="pick-view-column-item">
                          {item}
                        </View>
                      ))}
                  </PickerViewColumn>
                )}
              </PickerView>
              {/* bottom */}
              <View className={styles.btn}>
                <Button onClick={this.handleCancel}>取消</Button>
                <Button className={styles['btn-confirm']} onClick={this.handelOk}>
                  确定
                </Button>
              </View>
            </View>
          </View>
        </View>
      )
    );
  }
}

DateTimePicker.propTypes = {
  onConfirm: PropTypes.func,
  disabledTime: PropTypes.bool,
};

DateTimePicker.defaultProps = {
  onConfirm: () => {},
  style: {},
  onCancel: () => {},
};

export default DateTimePicker;
