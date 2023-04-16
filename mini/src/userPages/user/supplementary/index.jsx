import React from 'react';
import SupplementaryPage from '@layout/user/supplementary';
import { inject } from 'mobx-react';
import Page from '@components/page';

@inject('site')
class Supplementary extends React.Component {
  render() {
    return (
      <Page>
        <SupplementaryPage />
      </Page>
    );
  }
}

// eslint-disable-next-line new-cap
export default Supplementary;
