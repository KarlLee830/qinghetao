import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Input, Toast, Spin } from '@discuzqsdk/design';
import Header from '@components/header';
import styles from './index.module.scss';
import CaptchaInput from '../../user-center-edit-mobile/captcha-input';
import VerifyCode from '../../user-center-edit-mobile/verify-code';
import throttle from '@common/utils/thottle.js';
import Router from '@discuzqsdk/sdk/dist/router';
import classNames from 'classnames';
import GetQueryString from '../../../../common/utils/get-query-string';
import { withRouter } from 'next/router';
import { STEP_MAP } from '../../../../common/constants/payBoxStoreConstants';
@inject('site')
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
      isKeyBoardVisible: false, // 是否显示键盘
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
      isKeyBoardVisible: false, // 是否显示键盘
      initTimeValue: null,
      payPassword: null,
      payPasswordConfirmation: null,
      isSubmit: false,
    });
  };

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
            // this.submitPwa();
            this.setState({
              isKeyBoardVisible: false,
            });
          }
        },
      );
    } else if (type == 'delete') {
      this.setState({
        list: list.slice(0, list.length - 1),
      });
    }
  };

  // 处理支付相关逻辑
  handlePayBoxWithTriggerIncident = async () => {
    const { id } = this.props?.user;
    try {
      await this.props.user.updateUserInfo(id);
      this.props.payBox.visible = true;
      this.props.payBox.password = null;
      this.props.payBox.step = STEP_MAP.WALLET_PASSWORD;
      await this.props.payBox.getWalletInfo(id);
      this.props.user.userInfo.canWalletPay = true;
      Router.back();
    } catch (error) {
      console.error(error);
      Toast.error({
        content: '获取用户钱包信息失败',
        duration: 2000,
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
      .then(async (res) => {
        Toast.success({
          content: '重置密码成功',
          hasMask: false,
          duration: 2000,
        });
        const type = GetQueryString('type');
        if (type === 'paybox') {
          this.handlePayBoxWithTriggerIncident();
          this.initState();
          return;
        }
        Router.push({ url: `/my` });
        this.initState();
      })
      .catch((err) => {
        Toast.error({
          content: err.Msg || '重置密码失败',
          hasMask: false,
          duration: 2000,
        });
        this.initState();
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
      isKeyBoardVisible: false,
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
      isKeyBoardVisible: false,
    });
  };

  handleInputBlur1 = (e) => {
    this.setState({
      payPasswordConfirmation: e.target.value,
      isBlur: true,
    });
  };

  getVerifyCode = throttle(async ({ calback }) => {
    let { captchaRandStr, captchaTicket } = await this.props.showCaptcha();
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

  // 点击切换弹出键盘事件
  handleKeyBoardVisible = () => {
    this.setState({
      isKeyBoardVisible: !this.state.isKeyBoardVisible,
    });
  };

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

  render() {
    const {
      currentStep,
      list = [],
      isBlur,
      isKeyBoardVisible,
      initTimeValue,
      payPassword,
      payPasswordConfirmation,
      isSubmit,
    } = this.state;
    const mobile = this.props?.user.mobile;
    return (
      <div id={styles.findPayPwdContent}>
        <Header />
        <div className={styles.content}>
          <h3>找回支付密码</h3>
          <div className={styles.labelInfo}>
            <div>
              <span className={styles.labelName}>手机号</span>
              <span className={styles.labelValue} style={{ border: 'none' }}>
                {mobile}
              </span>
            </div>
            <div>
              <VerifyCode
                key={initTimeValue}
                initTimeValue={initTimeValue}
                key={currentStep}
                text={'发送验证码'}
                getVerifyCode={this.getVerifyCode}
              />
            </div>
          </div>
          <div className={styles.bindCode}>
            <span>验证码</span>
            <CaptchaInput
              handleKeyBoardVisible={this.handleKeyBoardVisible}
              isKeyBoardVisible={isKeyBoardVisible}
              currentStep={currentStep}
              updatePwd={this.updatePwd}
              list={list}
              isBlur={isBlur}
            />
          </div>
        </div>
        <div className={styles.labelInfo}>
          <div className={styles.labelValue}>
            <Input
              trim
              className={styles.input}
              value={payPassword}
              onChange={this.handleInputChange}
              onFocus={this.handleInputFocus}
              onBlur={this.handleInputBlur}
              mode="password"
              placeholder="设置新密码"
              type="number"
              maxLength={6}
            />
          </div>
        </div>
        <div className={styles.labelInfo}>
          <div className={styles.labelValue}>
            <Input
              trim
              className={styles.input}
              value={payPasswordConfirmation}
              onFocus={this.handleInputFocus1}
              onChange={this.handleInputChange1}
              onBlur={this.handleInputBlur1}
              mode="password"
              placeholder="重复新密码"
              type="number"
              maxLength={6}
            />
          </div>
        </div>
        <div
          className={classNames(styles.bottom, {
            [styles.btnPosition]: !!isKeyBoardVisible,
            [styles.bgBtnColor]: !this.getDisabledWithButton(),
          })}
        >
          <Button
            disabled={this.getDisabledWithButton()}
            full
            onClick={this.handleStepBtn}
            type={'primary'}
            className={styles.btn}
          >
            {isSubmit ? <Spin type="spinner">提交中...</Spin> : '提交'}
          </Button>
        </div>
      </div>
    );
  }
}

export default withRouter(index);
