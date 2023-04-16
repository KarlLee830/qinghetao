import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import layout from './index.module.scss';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import PcBodyWrap from '../components/pc-body-wrap';

const PROTOCAL = {
  PRIVACY: 'privacy',
  REGISTER: 'register'
}

@inject('site')
@inject('user')
@inject('thread')
@inject('commonLogin')
@inject('nicknameBind')
@observer
class BindNicknameH5Page extends React.Component {

  getProtocalData() {
    const { router, site } = this.props;

    const { type } = router.query;

    const { privacy, privacyContent, register, registerContent } = site?.webConfig?.agreement || {};

    let title = '';
    let content = '';

    if (type === PROTOCAL.PRIVACY) {
      title = '隐私协议';
      content = privacy ? privacyContent : '';
    } else if (type === PROTOCAL.REGISTER) {
      title = '注册协议';
      content = register ? registerContent : ''
    }

    return {
      title,
      content
    };
  }

  render() {
    const protocolData = this.getProtocalData()

    return (
      <PcBodyWrap>
      <div className={layout.pc_container}>
        <Header/>
        <div className={layout.pc_content}>
        <div className={layout.content}>
          <div className={layout.title}>
            {protocolData.title}
          </div>
          <div className={layout.item_content}>
            <pre>
              {protocolData.content}
            </pre>
          </div>
        </div>
        </div>
      </div>
      </PcBodyWrap>
    );
  }
}

export default withRouter(BindNicknameH5Page);
