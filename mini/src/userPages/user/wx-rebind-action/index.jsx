import React from 'react';
import WXRebindActionPage from '@layout/user/wx-rebind-action';
import { inject } from 'mobx-react';
import Page from '@components/page';
import { getParamCode, getUserProfile } from '../common/utils';

@inject('site')
class WXRebindAction extends React.Component {

  render() {
    return (
      <Page>
        <WXRebindActionPage />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default WXRebindAction;
