import React from 'react';
import UserCenterEditResetPayPwd from '../../../../components/user-center-edit-paypwd/reset-paypwd/index';
import HOCUserInfo from '@middleware/HOCUserInfo';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import ViewAdapter from '@components/view-adapter';
import { inject, observer } from 'mobx-react';
import Redirect from '@components/redirect';

@inject('site')
@observer
class ResetPayPwd extends React.Component {
  render() {
    return (
      <ViewAdapter
        h5={
          <div>
            <UserCenterEditResetPayPwd />
          </div>
        }
        pc={
          <Redirect jumpUrl={'/my/edit'} />
        }
        title={'重设支付密码'}
      />
    );
  }
}

export default HOCFetchSiteData(HOCUserInfo(ResetPayPwd));
