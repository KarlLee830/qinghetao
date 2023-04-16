import React, { Component } from 'react';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import Icon from '@discuzqsdk/design/dist/components/icon/index';

class CaptchaInput extends Component {

  validateTel = (value) => {
    return (/^[1][3-9]\d{9}$/.test(value))
  }
  // 点击显示数字键盘
  handleClickPwdItem = () => {
    this.props.handleKeyBoardVisible && this.props.handleKeyBoardVisible()
  }

  // 点击取消
  handleCancel = () => {
    this.props.handleKeyBoardVisible && this.props.handleKeyBoardVisible()
  }

  // 匹配输入的数字
  toMarryNumber = (num) => {
    let value;
    switch (num) {
      case 48:
      case 96:
        value = '0';
        break;
      case 49:
      case 97:
        value = '1';
        break;
      case 50:
      case 98:
        value = '2';
        break;
      case 51:
      case 99:
        value = '3';
        break;
      case 52:
      case 100:
        value = '4';
        break;
      case 53:
      case 101:
        value = '5';
        break;
      case 54:
      case 102:
        value = '6';
        break;
      case 55:
      case 103:
        value = '7';
        break;
      case 56:
      case 104:
        value = '8';
        break;
      case 57:
      case 105:
        value = '9';
        break;
      default:
        break;
    }
    return value;
  };

  // 监听键盘事件
  handleKeyDown = (e) => {
    const { isBlur, currentStep } = this.props
    // 只有当input失去焦点的时候才能进行更新
    if (currentStep === 'second' && !isBlur) return
    if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
      // 表示输入数字
      let set_num = this.toMarryNumber(e.keyCode);
      this.props.updatePwd && this.props.updatePwd(set_num, 'add');
    } else if (e.keyCode == 13) {
      // 表示输入回车
    } else if (e.keyCode == 8) {
      // 表示回退事件
      this.props.updatePwd && this.props.updatePwd('', 'delete');
    } else {
      // 其他非数字情况
    }
  };

  keyboardClickHander = (e) => {
    e && e.stopPropagation()
    const key = e.target.dataset?.key;
    if (key == null) {
      return null;
    }
    const { list = [] } = this.props;

    if (key === '-1') {
      if (list.length === 0) {
        this.handleCancel()
      } else {
        this.props.updatePwd && this.props.updatePwd('', 'delete');
      }

    } else if (list.length < 6) {
      this.props.updatePwd && this.props.updatePwd(key, 'add');
    }
  }

  renderPwdItem() {
    const { list = [] } = this.props;
    const nodeList = list.map((item, key) => (
      <View className={`${styles.payListItem} ${styles.activation}`} key={key}>
        {item}
      </View>
    ));
    if (nodeList.length < 6) {
      let curr = false;
      for (let i = nodeList.length; i < 6; i++) {
        if (!curr) {
          curr = true;
          nodeList.push(<View className={`${styles.payListItem} ${styles.curr}`} key={i}></View>);
        } else {
          nodeList.push(<View className={styles.payListItem} key={i}></View>);
        }
      }
    }

    return nodeList;
  }

  // 渲染键盘
  renderKeyBoard = () => {
    return (
      <View className={styles.keyboard} onClick={this.keyboardClickHander}>
        <View className={styles.line}>
          <View data-key="1" className={styles.column}>
            1
          </View>
          <View data-key="2" className={styles.column}>
            2
          </View>
          <View data-key="3" className={styles.column}>
            3
          </View>
        </View>
        <View className={styles.line}>
          <View data-key="4" className={styles.column}>
            4
          </View>
          <View data-key="5" className={styles.column}>
            5
          </View>
          <View data-key="6" className={styles.column}>
            6
          </View>
        </View>
        <View className={styles.line}>
          <View data-key="7" className={styles.column}>
            7
          </View>
          <View data-key="8" className={styles.column}>
            8
          </View>
          <View data-key="9" className={styles.column}>
            9
          </View>
        </View>
        <View className={styles.line}>
          <View className={`${styles.column} ${styles.special}`}></View>
          <View data-key="0" className={styles.column}>
            0
          </View>
          <View data-key="-1" className={`${styles.column} ${styles.special}`}>
            <Icon name="BackspaceOutlined" size={16} />
          </View>
        </View>
      </View>
    )
  }

  render() {
    const { isKeyBoardVisible } = this.props
    return (
      <View className={styles.payList} onClick={this.handleClickPwdItem}>
        {this.renderPwdItem()}
        {
          isKeyBoardVisible && (
            this.renderKeyBoard()
          )
        }
      </View>
    )
  }
}

export default CaptchaInput
