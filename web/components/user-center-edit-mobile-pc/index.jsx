import React, { Component } from 'react';
import styles from './index.module.scss';
import { Spin, Input, Icon, Dialog, Toast, Button } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import CaptchaInput from './captcha-input/index';
import VerifyCode from '../user-center-edit-mobile/verify-code';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';
import throttle from '@common/utils/thottle.js';
import classNames from 'classnames';

@inject('user')
@observer
class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      currentStep: 'first', // 表示当前步骤
      bindMobile: null,
      isBlur: false, // 表示是否失焦
      initTimeValue: null,
      initTime: 60,
      interval: null,
      initTimeText: '发送验证码',
      isSubmit: false,
    };
  }

  initState = (type) => {
    this.setState({
      list: [],
      currentStep: type ? type : 'first', // 表示当前步骤
      bindMobile: null,
      isBlur: false, // 表示是否失焦
      initTimeValue: null,
      initTime: 60,
      interval: null,
      initTimeText: '发送验证码',
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
            // this.submitPwa();
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
  handleStepBtn = throttle(async () => {
    if (this.getDisabledWithButton()) return;
    this.setState({
      isSubmit: true,
    });
    const { list = [], currentStep, bindMobile } = this.state;
    if (list.length !== 6) return;
    if (currentStep === 'first') {
      this.props.user.oldMobileVerifyCode = list.join('');
      this.props.user
        .verifyOldMobile()
        .then((res) => {
          if (this.state.interval != null) {
            clearInterval(this.state.interval);
          }
          this.initState('second');
        })
        .catch((err) => {
          Toast.error({
            content: err.Message || '验证失败',
            hasMask: false,
            duration: 2000,
          });
          this.initState();
          this.props.user.oldMobileVerifyCode = null;
        });
    } else if (currentStep === 'second') {
      this.props.user.newMobile = bindMobile;
      this.props.user.newMobileVerifyCode = list.join('');
      await this.props.user
        .rebindMobile()
        .then((res) => {
          Toast.success({
            content: '绑定成功',
            hasMask: false,
            duration: 2000,
          });
          setTimeout(() => {
            this.props.onClose();
            this.props.user.updateUserInfo(this.props.user.id);
            this.initState();
          }, 1000);
        })
        .catch((err) => {
          Toast.error({
            content: err.Message || '修改失败',
            hasMask: false,
            duration: 2000,
          });
          this.initState('second');
        });
    }
  }, 300);

  handleInputChange = (e) => {
    this.setState({
      bindMobile: e.target.value,
    });
  };

  handleInputFocus = (e) => {
    this.setState({
      isBlur: false,
    });
  };

  handleInputBlur = (e) => {
    this.setState({
      isBlur: true,
    });
  };

  getVerifyCode = throttle(async ({ calback }) => {
    const { originalMobile } = this.props.user;
    const { currentStep } = this.state;
    if (currentStep === 'first') {
      const { captchaRandStr, captchaTicket } = await this.props.showCaptcha();
      this.props.user
        .sendSmsVerifyCode({ mobile: originalMobile, captchaRandStr, captchaTicket })
        .then((res) => {
          this.setState({
            initTimeValue: res.interval,
          });
          if (calback && typeof calback === 'function') calback();
        })
        .catch((err) => {
          Toast.error({
            content: err.Message || '发送验证码失败',
            hasMask: false,
            duration: 2000,
          });
          this.setState({
            list: [],
          });
          if (calback && typeof calback === 'function') calback(err);
        });
    } else if (currentStep === 'second') {
      const { bindMobile } = this.state;
      const { captchaRandStr, captchaTicket } = await this.props.showCaptcha();
      this.props.user
        .sendSmsUpdateCode({ mobile: bindMobile, captchaRandStr, captchaTicket })
        .then((res) => {
          this.setState({
            initTimeValue: res.interval,
          });
          if (calback && typeof calback === 'function') calback();
        })
        .catch((err) => {
          console.log(err);
          Toast.error({
            content: err.Message || '发送验证码失败',
            hasMask: false,
            duration: 2000,
          });
          this.setState({
            bindMobile: null,
          });
          if (calback && typeof calback === 'function') calback(err);
        });
    }
  }, 300);

  validateTel = (value) => /^[1][3-9]\d{9}$/.test(value);

  /**
   * 获取按钮禁用状态
   * @returns true 表示禁用 false表示不禁用
   */
  getDisabledWithButton = () => {
    const { currentStep, list = [], bindMobile, isSubmit } = this.state;
    let isDisabled = false;
    if (isSubmit) {
      isDisabled = isSubmit;
    } else if (currentStep === 'first') {
      isDisabled = list.length !== 6;
    } else if (currentStep === 'second') {
      isDisabled = list.length !== 6 || !this.validateTel(bindMobile);
    }
    return isDisabled;
  };

  // 点击关闭
  handleClose = () => {
    this.initState();
    this.props.onClose();
  };

  // 渲染button文案
  renderButtonText = () => {
    const { isSubmit, currentStep } = this.state;
    if (isSubmit) {
      return <Spin type="spinner">提交中...</Spin>;
    } else {
      if (currentStep === 'first') {
        return '下一步';
      } else {
        return '提交';
      }
    }
  };

  render() {
    const mobile = this.props.user?.mobile;
    const { currentStep, list = [], isBlur, bindMobile, isSubmit } = this.state;
    const valuePassCheck = currentStep === 'second' ? this.validateTel(bindMobile) : true;
    return (
        <Dialog className={styles.userMobileWrapper} visible={this.props.visible} onClose={this.props.onClose}>
          <div className={styles.userMobileContent}>
            <div className={styles.title}>
              <span className={styles.titleValue}>{currentStep === 'first' ? '验证旧手机' : '绑定手机号'}</span>
              <Icon onClick={this.handleClose} name="CloseOutlined" size={12} color={'#8490A8'} />
            </div>
            <div className={`${styles.inputItem}`}>
              {/* {
                currentStep === 'first' && (
                  <div className={styles.labelName}>验证旧手机</div>
                )
              } */}
              <div className={styles.mobileItem}>
                {currentStep === 'first' ? (
                  <Input trim value={mobile} />
                ) : (
                  <Input
                    trim
                    key={currentStep}
                    placeholder="输入新手机号码"
                    onChange={this.handleInputChange}
                    focus={true}
                    onBlur={this.handleInputBlur}
                    onFocus={this.handleInputFocus}
                    value={bindMobile}
                  />
                )}
                <div className={`${styles.labelValue} ${styles.verifyCodeBtn}`}>
                  <VerifyCode
                    className={styles.btnColor}
                    btnType={true}
                    initTimeValue={this.state.initTimeValue}
                    valuePassCheck={valuePassCheck}
                    key={currentStep}
                    text={currentStep === 'first' ? '发送验证码' : '获取验证码'}
                    getVerifyCode={this.getVerifyCode}
                  />
                </div>
              </div>
            </div>
            <div className={styles.inputItem}>
              <div className={styles.labelName}>请输入手机验证码</div>
              <CaptchaInput
                currentStep={currentStep}
                updatePwd={this.updatePwd}
                list={list}
                isBlur={isBlur}
                visible={this.props.visible}
              />
            </div>
            <div
              className={classNames(styles.bottom, {
                [styles.bgBtnColor]: !this.getDisabledWithButton(),
              })}
            >
              <Button
                disabled={this.getDisabledWithButton()}
                onClick={this.handleStepBtn}
                type={'primary'}
                className={styles.btn}
              >
                {this.renderButtonText()}
              </Button>
            </div>
          </div>
        </Dialog>
    );
  }
}

export default HOCTencentCaptcha(index);
