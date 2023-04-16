import React from 'react';
import { inject } from 'mobx-react';
import { Popup } from '@discuzqsdk/design';
import layout from './index.module.scss';
import { getClientHeight } from '@common/utils/get-client-height';

const PROTOCAL = {
  PRIVACY: 'privacy',
  REGISTER: 'register'
}

@inject('commonLogin')
@inject('site')
class PopProtocol extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      height: null,
    };
  }
  getProtocalData(type) {
    const { site } = this.props;
    const { privacy, privacyContent, register, registerContent } = site?.webConfig?.agreement || {};;

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

  componentDidMount() {
    const cliengtHeight = getClientHeight();
    this.setState({ height: cliengtHeight });
  }


  render() {
    const { protocolVisible, protocolStatus } = this.props;
    const { commonLogin } = this.props;
    const { height } = this.state;
    const protocolData = this.getProtocalData(protocolStatus);

    return (
      <Popup
        position="bottom"
        visible={protocolVisible}
        onClose={() => { commonLogin.setProtocolVisible(false) }}
      >
        <div className={layout.content} style={height && { height: `${height - 48}px` }}>
          <div className={layout.title}>
            {protocolData.title}
          </div>
          <div className={layout.item_content}>
            <pre>
              {protocolData.content}
            </pre>
          </div>
          <div className={layout.bottom} onClick={() => commonLogin.setProtocolVisible(false)}>
            <div className={layout.bottom_content}>
              关闭
            </div>
          </div>
        </div>
      </Popup>
    );
  }
}

export default PopProtocol;
