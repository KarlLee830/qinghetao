import React from 'react';
import UserCenterEditPayPwd from '../../../../components/user-center-edit-paypwd';
import HOCUserInfo from '@middleware/HOCUserInfo';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import ViewAdapter from '@components/view-adapter';
import { inject, observer } from 'mobx-react';
import Redirect from '@components/redirect';

@inject('site')
@observer
class EditPayPwdPage extends React.Component {
  render() {
    return (
      <ViewAdapter
        h5={
          <div>
            <UserCenterEditPayPwd />
          </div>
        }
        pc={
          <Redirect jumpUrl={'/my/edit'} />
        }
        title={'设置支付密码'}
      />
    );
  }
}

export default HOCFetchSiteData(HOCUserInfo(EditPayPwdPage));
