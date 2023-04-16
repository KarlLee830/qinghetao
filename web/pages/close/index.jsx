import React from 'react';
import { inject, observer } from 'mobx-react';
import isServer from '@common/utils/is-server';
import Router from '@discuzqsdk/sdk/dist/router';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

import IndexPCPage from '@layout/close/pc';
import IndexH5Page from '@layout/close/h5';

@inject('site')
@observer
class CloseSite extends React.Component {
  render() {
    const { site } = this.props;
    const { closeSiteConfig, platform } = site;

    // if (!isServer() && !closeSiteConfig) {
    //   Router.redirect({url: '/'});
    // }
    
    if (platform === 'pc') {
      return (
        <IndexPCPage/>
      );
    }
    return <IndexH5Page/>;

  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(CloseSite);
