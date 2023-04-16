import Page from '@components/page';
import React, { useEffect } from 'react';
import UserCenterEditInfo from '@components/user-center-edit-info';
import Taro from '@tarojs/taro';

export default function index() {
  useEffect(() => {
    Taro.hideShareMenu();
  });

  return (
    <Page>
      <UserCenterEditInfo />
    </Page>
  );
}
