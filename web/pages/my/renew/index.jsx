import React from 'react';
import RenewalFee from '../../../layout/my/renew';
import ViewAdapter from '@components/view-adapter';
import Redirect from '@components/redirect';

export default function index() {
  return (
    <ViewAdapter
      h5={
        <div>
          <RenewalFee />
        </div>
      }
      pc={<Redirect jumpUrl={'/my'} />}
      title={'立即续费'}
    />
  );
}
