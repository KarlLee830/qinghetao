import React, { Component } from 'react';
import UserCenterEditInfo from '@components/user-center-edit-info';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';
import ViewAdapter from '@components/view-adapter';

function Index() {
  return (
    <div>
      <UserCenterEditInfo />
    </div>
  );
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithLogin(Index));

