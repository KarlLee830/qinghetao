import React from 'react';
import { inject } from 'mobx-react';
import layout from './index.module.scss';
import PopProtocol from '../pop-protocol';

@inject('site')
@inject('commonLogin')
class Protocol extends React.Component {
  render() {
    const { site, commonLogin } = this.props;
    const { platform } = site;
    return (
      <>
        {
          site?.isAgreementRegister || site?.isAgreementPrivacy
            ? <div className={platform === 'h5' ? layout['otherLogin-tips'] : layout.pc_otherLogin_tips} >
                注册登录即表示您同意
                {
                  site?.isAgreementRegister
                    ? <span onClick={() => {
                      if (platform === 'pc') {
                        window.open('/user/agreement?type=register');
                      }
                      commonLogin.setProtocolInfo('register');
                    }}>《注册协议》</span>
                    : <></>
                }
                {
                  site?.isAgreementPrivacy
                    ? <span onClick={() => {
                      if (platform === 'pc') {
                        window.open('/user/agreement?type=privacy');
                      }
                      commonLogin.setProtocolInfo('privacy');
                    }}>《隐私协议》</span>
                    : <></>
                }
              </div>
            : <></>
        }
        {
          platform === 'h5'
            ? <PopProtocol protocolVisible={commonLogin.protocolVisible} protocolStatus={commonLogin.protocolStatus}/>
            : <></>
        }
      </>
    );
  }
}

export default Protocol;
