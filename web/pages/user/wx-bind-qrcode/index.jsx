import React from 'react';
import WeixinBindQrCodePage from '@layout/user/h5/wx-bind-qrcode';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCLoginMode from '@middleware/HOCLoginMode';

@inject('site')
class WeixinBind extends React.Component {
  render() {
    return <ViewAdapter
              h5={<WeixinBindQrCodePage/>}
              pc={<WeixinBindQrCodePage/>}
              title={`微信扫码绑定`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCLoginMode('weixin')(WeixinBind));
