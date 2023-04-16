import React from 'react';
import { View, Input} from '@tarojs/components';
import layout from './index.module.scss';

class CaptchaInput extends React.Component {
  static defaultProps = {
    captcha: '',  // 验证码
    setCaptcha: () => {}, // 设置验证码
    isFocus: false, // 是否获取焦点
    setIsFocus: () => {}  // 设置焦点
  }
  constructor(props) {
    super(props);
    this.state = {
      inputRef: ['', '', '', '', '', ''],
    };
  }

  indexClass(index) {
    const { captcha, isFocus } = this.props;
    let indexClass = '';
    if((((index === 0) || captcha[index - 1]) && isFocus) || captcha[index]){
      indexClass = layout['captchaInput-input_val'];
    }
    return `${layout['captchaInput-input']} ${indexClass}`;
  }

  render() {
    const { inputRef } = this.state;
    const { captcha, setCaptcha, isFocus, setIsFocus } = this.props;
    return (
      <View className={layout.container}
        onClick={() => {
          setIsFocus(true);
        }}
      >
        <Input
          type="number"
          value={captcha}
          className={layout.hide_input}
          focus={isFocus}
          onBlur={() => {
            setIsFocus(false);
          }}
          maxlength={6}
          onInput={(e) => {
            const val = e?.detail?.value;
            if(val.length === 6 || val.length === 0){
              setIsFocus(false);
            }
            setCaptcha(e?.detail?.value)
          }}
        />
        {inputRef.map((item, index) => {
          const className = this.indexClass(index);
          return (
            <View
              key={index}
              className={className}
            >{captcha[index] || ''}</View>
        )})}
      </View>
    );
  }
}

export default CaptchaInput;
