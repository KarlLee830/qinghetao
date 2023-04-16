import React from 'react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import Page from '@components/page';
import UserCenterEditPayPwd from '../../../../components/user-center-edit-paypwd/index';

export default function index() {
  return (
    <Page>
      <UserCenterEditPayPwd />
    </Page>
  );
}
