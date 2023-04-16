import React from 'react';
import { inject } from 'mobx-react';
import layout from './index.module.scss';
import { Input } from '@discuzqsdk/design';

let inputIndex = null;

@inject('commonLogin')
class CaptchaInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      inputRef: ['', '', '', '', '', ''],
    };
  }

  getValue = () => {
    const value = ['', '', '', '', '', ''];
    const { captcha = '' } = this.props;
    captcha.split('').map((item, index) => {
      value[index] = item;
    });
    return value;
  };

  // 点击输入框聚焦到最前端未填写的地方
  focusInput = (index, eve) => {
    const value = this.getValue();
    const { inputRef } = this.state;
    if (index === inputIndex) {
      return;
    }
    eve.target.blur();
    for (let i = 0; i < value.length; i += 1) {
      if (value[i] === '' || i === 5) {
        inputIndex = i;
        inputRef[i].focus();
        break;
      }
    }
  };

  // 输入事件
  setChange = (index, e) => {
    const { inputCallback, commonLogin } = this.props;
    const value = this.getValue();
    const val = e.target.value;
    const v = [...value];
    if (index < 5 && val.length === 2) {
      v[index + 1] = val.substring(2, 1);
    } else {
      v[index] = val.substring(0, 1);
    }
    inputCallback(v.join(''));
    commonLogin.setIsSend(false);
    if (index === 5 && !v.includes('')) {
      e.target.blur();
    }
    if (val === '' || (index === 5 && !v.includes('')) || (v.indexOf('') - 1 !== index)) {
      return;
    }
    this.nextFocus(e, index + val.length - 1);
    return;
  };

  // 删除事件
  setBackspace = (index, e) => {
    const val = e.target.value;
    if (val === '') {
      this.lastFocus(e, index);
    }
  };

  // 切换到上一个输入框获取焦点
  lastFocus = (e, index) => {
    const { inputRef } = this.state;
    e.target.blur();
    if (index > 0) {
      inputIndex = index - 1;
      inputRef[index - 1].focus();
    }
  };

  // 切换到下一个输入框获取焦点
  nextFocus = (e, index) => {
    const { inputRef } = this.state;
    e.target.blur();
    if (index < 5) {
      inputIndex = index + 1;
      inputRef[index + 1].focus();
    }
  };

  // 设置对应下标的输入框获取焦点
  getInputDom = (e, index) => {
    const { inputRef } = this.state;
    const i = inputRef;
    i[index] = e;
    this.setState({
      inputRef: i,
    });
  };

  componentDidUpdate() {
    const { commonLogin } = this.props;
    if (commonLogin.isSend) {
      this.state.inputRef[0].focus();
    }
  }

  render() {
    const value = this.getValue();
    return (
      <div className={layout.container}>
        {value.map((item, index) => (
          <Input
            mode="number"
            htmlType="number"
            key={index}
            value={value[index]}
            onChange={(e) => {
              this.setChange(index, e);
            }}
            className={`${layout['captchaInput-input']} ${item ? layout['captchaInput-input_val'] : ''}`}
            onFocus={(e) => {
              this.focusInput(index, e);
            }}
            maxLength={2}
            onBackspace={(e) => {
              this.setBackspace(index, e);
            }}
            useRef={(e) => {
              this.getInputDom(e, index);
            }}
          />
        ))}
      </div>
    );
  }
}

export default CaptchaInput;
