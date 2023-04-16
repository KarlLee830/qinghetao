import React from 'react';
// import Input from '@discuzqsdk/design/dist/components/input/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import { View } from '@tarojs/components';
import layout from './index.module.scss';
import CaptchaInput from './captcha-input';
import { throttle } from '@common/utils/throttle-debounce';

class PhoneInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFocus: false
    };
  }
  setCaptcha = (code) => {
    const { phoneCodeCallback = () => {} } = this.props;
    const val = code?.match(/\d+/g)?.join('') || '';
    phoneCodeCallback(val);
  };
  setPhoneNum = (e) => {
    const { phoneNumCallback = () => {} } = this.props;
    const val = e?.target?.value?.match(/\d+/g)?.join('') || '';
    phoneNumCallback(val);
  };

  setIsFocus = (isFocus) => {
    this.setState({
      isFocus
    })
  };

  handleSendCode = () => {
    const { sendCodeCallback = () => {} } = this.props;
    sendCodeCallback(() => {
      this.setState({
        isFocus: true
      })
    });
  }

  render() {
    const { phoneNum, captcha, codeTimeout } = this.props;
    return (
      <>
        {/* 手机号输入 start */}
        <View className={layout.phoneInput}>
          <Input
            miniType="number"
            mode="number"
            maxLength={11}
            className={layout.input}
            value={phoneNum}
            placeholder="请输入手机号码"
            onChange={this.setPhoneNum}
          />
          {codeTimeout ? (
            <View className={layout.countDown}>{codeTimeout}秒后再发送</View>
          ) : (
            <View className={layout.sendCaptcha} onClick={throttle(() => this.handleSendCode(), 500)}>
              发送验证码
            </View>
          )}
        </View>
        {/* 手机号输入 end */}
        {/* 验证码 start */}
        <View className={layout.captchaInput}>
          <View className={layout['captchaInput-title']}>短信验证码</View>
          <CaptchaInput captcha={captcha} setCaptcha={this.setCaptcha} isFocus={this.state.isFocus} setIsFocus={this.setIsFocus}/>
        </View>
        {/* 验证码 end */}
      </>
    );
  }
}

export default PhoneInput;
