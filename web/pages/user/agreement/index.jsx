import React from 'react';
import AgreementPage from '@layout/user/h5/agreement';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';
import Redirect from '@components/redirect';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
class Agreement extends React.Component {
  render() {
    const { router, site } = this.props;
    const { type } = router.query;
    let pageType = '';
    switch (type) {
      case 'register':
        pageType = '注册协议'
        break;
      case 'privacy':
        pageType = '隐私协议'
        break;
    }
    return <ViewAdapter
              h5={
                <Redirect jumpUrl={'/user/login'} />
              }
              pc={<AgreementPage/>}
              title={`${pageType}`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Agreement);
