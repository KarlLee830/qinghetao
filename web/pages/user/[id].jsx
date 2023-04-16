import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import H5OthersUserCenter from '@layout/my/others-users/h5';
import PCOthersUserCenter from '@layout/my/others-users/pc';
import HOCFetchSiteData from '../../middleware/HOCFetchSiteData';
import ViewAdapter from '@components/view-adapter';
import { readUser } from '@server';

@inject('site')
@inject('user')
@observer
class Index extends Component {
  static async getInitialProps(ctx, options) {
    const id = ctx?.query?.id;
    const serverData = {
      userData: null,
    };

    if (id) {
      const userRes = await readUser({ params: { userId: id } });

      if (userRes.code === 0) {
        serverData.userData = userRes.data;
      }
    }

    return {
      serverData,
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      userData: props.serverData && props.serverData.userData ? props.serverData.userData : null,
    };
  }

  render() {
    let title = '';
    if (this.state.userData) {
      title = `${this.state.userData.nickname}的主页`;
    } else {
      const { query = {} } = this.props.router;
      const { id = '' } = query;

      const targetUser = this.props.user.targetUsers[id] || {};

      title = targetUser.nickname ? `${targetUser.nickname}的主页` : '他人主页';
    }

    return (
      <ViewAdapter
        h5={<H5OthersUserCenter />}
        pc={<PCOthersUserCenter />}
        title={title}
      />
    );
  }
}

export default HOCFetchSiteData(Index);
