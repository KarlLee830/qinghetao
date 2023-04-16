import React from 'react';
import BindNicknameH5Page from '@layout/user/h5/bind-nickname';
import { inject } from 'mobx-react';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
class BindNickname extends React.Component {
  render() {
    return <ViewAdapter
              h5={<BindNicknameH5Page />}
              pc={<BindNicknameH5Page />}
              title={`设置昵称`}
            />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(BindNickname);
