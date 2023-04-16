import React from 'react';
import { withRouter } from 'next/router';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';
import ViewAdapter from '@components/view-adapter';
import Upgrade from '@layout/my/upgrade';
import Redirect from '@components/redirect';

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '用户组升级'
    }
  }

  render() {
    const { title } = this.state;

    return (
      <ViewAdapter
        h5={<Upgrade setTitle={(title) => this.setState({ title })} />}
        pc={<Redirect jumpUrl={'/my'} />}
        title={title}
      />
    );
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(HOCWithLogin(withRouter(Index)));
