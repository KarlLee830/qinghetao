import React from 'react';
import { inject } from 'mobx-react';
import layout from './index.module.scss';
import { Icon } from '@discuzqsdk/design';

@inject('site')
class WeixinQrCode extends React.Component {
  render() {
    const { orCodeImg, orCodeTips, isValid, site, refresh } = this.props;
    const { platform, wechatEnv } = site;
    const invalidTip = `${wechatEnv === 'miniProgram' ? '小程序码' : '二维码'}已过期，请点击刷新`;
    const h5MiniCodeMask = wechatEnv === 'miniProgram' && platform === 'h5' ? layout.h5_miniCodeMask : '';

    return (
      <div className={`${platform === 'h5' ? layout.orCode : layout.pc_orCode} ${isValid ? '' : layout.invalid}`}>
        <div className={platform === 'h5' ? `${layout.orCode__img} ${wechatEnv === 'miniProgram' ? layout.orCode_mini : ''}` : `${layout.pc_orCode__img} ${wechatEnv === 'miniProgram' ? layout.pc_orCode_mini : ''}`}>
          {
            orCodeImg
              ? <img src={orCodeImg} alt={orCodeImg}/>
              : <></>
          }
        </div>
        { !isValid ? 
          <div onClick={() => refresh()} className={`${layout.codeMask} ${wechatEnv === 'miniProgram' ? layout.miniCodeMask : ''} ${h5MiniCodeMask}`}>
            <Icon name='RenovateOutlined' size='40' />
          </div>
          : ''
        }
        <p className={platform === 'h5' ? layout.orCode__text : layout.pc_orCode__text}>
          {isValid ? orCodeTips : invalidTip}
        </p>
      </div>
    );
  }
}

export default WeixinQrCode;
