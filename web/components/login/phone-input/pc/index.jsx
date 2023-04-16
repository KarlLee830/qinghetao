import React from 'react';
import layout from './index.module.scss';
import { Input } from '@discuzqsdk/design';
import { throttle } from '@common/utils/throttle-debounce';

class PhoneInputPC extends React.Component {
  setCaptcha = (e) => {
    const { phoneCodeCallback = () => {} } = this.props;
    const val = e?.target?.value?.match(/\d+/g)?.join('') || '';
    phoneCodeCallback(val);
  };
  setPhoneNum = (e) => {
    const { phoneNumCallback = () => {} } = this.props;
    const val = e?.target?.value?.match(/\d+/g)?.join('') || '';
    phoneNumCallback(val);
  };

  render() {
    const { phoneNum, captcha, codeTimeout, sendCodeCallback = () => {}, enterCallback = () => {} } = this.props;
    return (
      <div className={layout.pc_phone_input}>
        {/* 手机号输入 start */}
        <div className={layout.tips}>手机号</div>
        <div className={layout.phoneInputPC}>
          <Input
            mode="number"
            className={layout.input}
            value={phoneNum}
            clearable={true}
            placeholder="请输入您的手机号码"
            onChange={this.setPhoneNum}
            maxLength={11}
          />
        </div>
        {/* 手机号输入 end */}
        {/* 验证码 start */}
        <div className={layout.tips}>手机验证码</div>
        <div className={layout.captchaInput}>
          <Input
            mode="number"
            className={layout.input}
            value={captcha}
            placeholder="请输入手机验证码"
            onChange={this.setCaptcha}
            onEnter={enterCallback}
            maxLength={6}
          />
          {codeTimeout ? (
            <div className={layout.countDown}>{codeTimeout}秒后再发送</div>
          ) : (
            <div className={layout.sendCaptcha} onClick={throttle(() => sendCodeCallback(), 500)}>
              发送验证码
            </div>
          )}
        </div>
        {/* 验证码 end */}
      </div>
    );
  }
}

export default PhoneInputPC;
