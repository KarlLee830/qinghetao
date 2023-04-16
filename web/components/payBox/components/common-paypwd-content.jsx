import React, { Component } from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import { STEP_MAP } from '../../../../common/constants/payBoxStoreConstants';

@inject('payBox')
@observer
export default class Index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
    };
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
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

  renderPwdItem() {
    const { list = [], whetherIsShowPwdBox } = this.props;
    const nodeList = list.map((item, key) => (
      <div
        className={`${styles.payListItem} ${styles.activation} ${whetherIsShowPwdBox && styles.payListItem01}`}
        key={key}
      >
        {'●'}
      </div>
    ));
    if (nodeList.length < 6) {
      let curr = false;
      for (let i = nodeList.length; i < 6; i++) {
        if (!curr) {
          curr = true;
          nodeList.push(
            <div
              className={`${styles.payListItem} ${styles.curr} ${whetherIsShowPwdBox && styles.payListItem01}`}
              key={i}
            ></div>,
          );
        } else {
          nodeList.push(
            <div className={`${styles.payListItem} ${whetherIsShowPwdBox && styles.payListItem01}`} key={i}></div>,
          );
        }
      }
    }

    return nodeList;
  }

  render() {
    return (
      <div>
        <div className={styles.payList}>{this.renderPwdItem()}</div>
      </div>
    );
  }
}

Index.defaultProps = {
  updatePwd: function () { }, // 更新密码回调
  whetherIsShowPwdBox: false, // 是否显示输入密码框 默认显示下划线密码输入（样式）
};
