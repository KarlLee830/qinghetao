import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Spin, Input, Toast, Icon } from '@discuzqsdk/design';
import styles from './index.module.scss';
import CaptchaInput from '../../user-center-edit-mobile-pc/captcha-input/index';
import VerifyCode from '../../user-center-edit-mobile/verify-code';
import throttle from '@common/utils/thottle.js';
import Router from '@discuzqsdk/sdk/dist/router';
import classNames from 'classnames';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';

@inject('user')
@inject('payBox')
@observer
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      currentStep: 'second', // 表示当前步骤
      isBlur: true, // 表示是否失焦
      initTimeValue: null,
      payPassword: null,
      payPasswordConfirmation: null,
      isSubmit: false, // 是否点击提交
    };
  }

  initState = () => {
    this.setState({
      list: [],
      currentStep: 'second', // 表示当前步骤
      isBlur: true, // 表示是否失焦
      initTimeValue: null,
      payPassword: null,
      payPasswordConfirmation: null,
      isSubmit: false,
    });
  };

  componentWillUnmount() {
    this.initState();
  }

  updatePwd = (set_num, type) => {
    const { list = [] } = this.state;
    if (type == 'add') {
      let list_ = [...list];
      if (list.length >= 6) {
        return;
      }
      this.setState(
        {
          list: [].concat(list_, [set_num]),
        },
        () => {
          if (this.state.list.length === 6) {
          }
        },
      );
    } else if (type == 'delete') {
      this.setState({
        list: list.slice(0, list.length - 1),
      });
    }
  };

  // 点击下一步
  handleStepBtn = () => {
    if (this.getDisabledWithButton()) return;
    this.setState({
      isSubmit: true,
    });
    const { list = [], payPassword, payPasswordConfirmation } = this.state;
    if (payPassword !== payPasswordConfirmation) {
      Toast.error({
        content: '两次密码输入有误',
        hasMask: false,
        duration: 2000,
      });
      this.initState();
      return;
    }
    const mobile = this.props?.user.originalMobile;
    const code = list.join('');
    this.props.payBox
      .forgetPayPwd({
        mobile,
        code,
        payPassword,
        payPasswordConfirmation,
      })
      .then((res) => {
        Toast.success({
          content: '重置密码成功',
          hasMask: false,
          duration: 2000,
        });
        this.initState();
        this.handleClose();
      })
      .catch((err) => {
        Toast.error({
          content: err.Msg || '重置密码失败',
          hasMask: false,
          duration: 2000,
        });
        this.initState();
        this.handleClose();
      });
  };

  handleInputChange = (e) => {
    this.setState({
      payPassword: e.target.value,
      isBlur: false,
    });
  };

  handleInputChange1 = (e) => {
    this.setState({
      payPasswordConfirmation: e.target.value,
      isBlur: false,
    });
  };

  handleInputFocus = (e) => {
    this.setState({
      isBlur: false,
    });
  };

  handleInputBlur = (e) => {
    this.setState({
      payPassword: e.target.value,
      isBlur: true,
    });
  };

  handleInputFocus1 = () => {
    this.setState({
      isBlur: false,
    });
  };

  handleInputBlur1 = (e) => {
    this.setState({
      payPasswordConfirmation: e.target.value,
      isBlur: true,
    });
  };

  getVerifyCode = throttle(async ({ calback }) => {
    const { captchaRandStr, captchaTicket } = await this.props.showCaptcha();
    const mobile = this.props?.user.originalMobile;
    this.props.payBox
      .sendSmsVerifyCode({ mobile, captchaRandStr, captchaTicket })
      .then((res) => {
        this.setState(
          {
            initTimeValue: res.interval,
          },
          () => {
            if (calback && typeof calback === 'function') calback();
          },
        );
      })
      .catch((err) => {
        Toast.error({
          content: err.Message || '获取验证码失败',
          hasMask: false,
          duration: 2000,
        });
        this.setState({
          list: [],
          initTimeValue: null,
        });
        if (calback && typeof calback === 'function') calback(err);
      });
  }, 300);

  /**
   * 获取按钮禁用状态
   * @returns true 表示禁用 false表示不禁用
   */
  getDisabledWithButton = () => {
    const { list = [], payPassword, payPasswordConfirmation, isSubmit } = this.state;
    let disabled = false;
    disabled = !payPassword || !payPasswordConfirmation || list.length !== 6 || isSubmit;
    return disabled;
  };

  handleClose = () => {
    this.initState();
    this.props.onClose();
  };

  render() {
    const {
      currentStep,
      list = [],
      isBlur,
      initTimeValue,
      payPassword,
      payPasswordConfirmation,
      isSubmit,
    } = this.state;
    const mobile = this.props?.user.mobile;
    return (
      <div className={styles.userMobileWrapper}>
        <div className={styles.userMobileContent}>
          <div className={styles.title}>
            <span className={styles.titleValue}>找回支付密码</span>
            <Icon onClick={this.handleClose} name="CloseOutlined" size={12} color="#8490A8" />
          </div>
          <div className={`${styles.inputItem} ${styles.mobileItem}`}>
            <Input value={mobile} />
            <div className={styles.verifyCode}>
              <VerifyCode
                key={currentStep}
                btnType={'text'}
                className={styles.btnStyle}
                initTimeValue={initTimeValue}
                text={'发送验证码'}
                getVerifyCode={this.getVerifyCode}
              />
            </div>
          </div>
          <div className={styles.inputItem}>
            <div className={styles.labelName}>请输入短信验证码</div>
            <CaptchaInput currentStep={currentStep} updatePwd={this.updatePwd} list={list} isBlur={isBlur} />
          </div>
          <div className={`${styles.inputItem} ${styles.inputMiddle}`}>
            <Input
              tirm
              value={payPassword}
              onChange={this.handleInputChange}
              onFocus={this.handleInputFocus}
              onBlur={this.handleInputBlur}
              mode="password"
              placeholder="请输入新支付密码"
              maxLength={6}
              type="number"
            />
          </div>
          <div className={styles.inputItem}>
            <Input
              tirm
              value={payPasswordConfirmation}
              onFocus={this.handleInputFocus1}
              onChange={this.handleInputChange1}
              onBlur={this.handleInputBlur1}
              mode="password"
              placeholder="请重复输入新支付密码"
              maxLength={6}
              type="number"
            />
          </div>
          <div
            className={classNames(styles.bottom, {
              [styles.bgBtnColor]: !this.getDisabledWithButton(),
            })}
          >
            <Button
              disabled={this.getDisabledWithButton()}
              full
              onClick={this.handleStepBtn}
              type="primary"
              className={styles.btn}
            >
              {isSubmit ? <Spin type="spinner">提交中...</Spin> : '设置新支付密码'}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default HOCTencentCaptcha(index);
