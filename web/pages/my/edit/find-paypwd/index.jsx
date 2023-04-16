import React from 'react';
import UserCenterEditFindPayPwd from '../../../../components/user-center-edit-paypwd/find-paypwd/index';
import HOCUserInfo from '@middleware/HOCUserInfo';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';
import ViewAdapter from '@components/view-adapter';
import { inject, observer } from 'mobx-react';
import Redirect from '@components/redirect';

@inject('site')
@observer
class FindPayPwdPage extends React.Component {
  render() {
    return (
      <ViewAdapter
        h5={
          <div>
            <UserCenterEditFindPayPwd {...this.props} />
          </div>
        }
        pc={
          <Redirect jumpUrl={'/my/edit'} />
        }
        title={'找回支付密码'}
      />
    );
  }
}

export default HOCFetchSiteData(HOCUserInfo(HOCTencentCaptcha(FindPayPwdPage)));
