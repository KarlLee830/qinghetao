import React from 'react';
import { Button } from '@discuzqsdk/design';
import styles from './index.module.scss';
import classNames from 'classnames';
export default class VerificationCode extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      initTimeText: props.text ? props.text : '获取验证码',
      buttonDisabled: false, // 初始设置按钮是可以点击的
      interval: null,
      initTimeValue: props.initTimeValue,
      initTime: 60,
    };
  }

  static getDerivedStateFromProps(props, state) {
    if (state.initTimeValue !== props.initTimeValue) {
      return {
        initTimeValue: props.initTimeValue,
        initTime: props.initTimeValue,
      };
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.initTimeValue !== this.state.initTimeValue) {
      if (!this.interval) {
        this.setTimeChecker();
      }
    }
  }

  setTimeChecker = () => {
    const { initTimeValue } = this.state;
    if (this.interval !== null) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => {
      const { initTime } = this.state;
      this.setState({
        initTime: initTime - 1,
        initTimeText: `${initTime - 1}秒后再发送`,
        buttonDisabled: true,
      });
      if (initTime <= 0) {
        this.setState({
          initTime: initTimeValue,
          initTimeText: '重新获取',
          buttonDisabled: false,
          initTimeValue: null,
        });
        if (this.interval !== null) {
          clearInterval(this.interval);
        }
      }
    }, 1000);
  };

  buttonClick = () => {
    this.buttonClickAction();
  };

  buttonClickAction = () => {
    if (this.state.buttonDisabled) {
      return false;
    }

    this.props.getVerifyCode({
      calback: (err) => {
        if (err) {
          this.setState({
            buttonDisabled: false,
          });
          return;
        }
        this.setTimeChecker();
      },
    });
  };

  render() {
    const { valuePassCheck, btnType, className } = this.props;
    const { buttonDisabled } = this.state;
    return (
      <div
        className={classNames(styles.verifyCodeBtn, {
          [styles.verifyCodeBgColor]: !(buttonDisabled || !valuePassCheck),
        })}
      >
        <Button
          className={`${styles.btn} ${className}`}
          type={btnType ? 'text' : !buttonDisabled ? 'primary' : 'text'}
          disabled={buttonDisabled || !valuePassCheck}
          onClick={this.buttonClickAction.bind(this)}
        >
          {this.state.initTimeText}
        </Button>
      </div>
    );
  }
}
VerificationCode.defaultProps = {
  getVerifyCode() {},
  valuePassCheck: true, // 校验是否可以点击
  initTimeValue: 60, // 默认倒计时间
};
VerificationCode.propTypes = {};
