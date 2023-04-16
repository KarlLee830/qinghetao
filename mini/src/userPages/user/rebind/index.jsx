import React from 'react';
import RebindPage from '@layout/user/rebind';
import { inject } from 'mobx-react';
import Page from '@components/page';

@inject('site')
class Rebind extends React.Component {
  render() {
    return (
      <Page>
        <RebindPage />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default Rebind;
