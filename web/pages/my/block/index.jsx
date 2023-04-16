import React from 'react';
import { inject, observer, Observer, useStore } from 'mobx-react';
import IndexH5Page from '@layout/my/block/h5';
import IndexPCPage from '@layout/my/block/pc';
import { Toast } from '@discuzqsdk/design';
import ViewAdapter from '@components/view-adapter';

import HOCFetchSiteData from '@middleware/HOCFetchSiteData';

@inject('site')
@inject('search')
@observer
class Index extends React.Component {
  render() {
    const { site } = this.props;

    return <ViewAdapter h5={<IndexH5Page />} pc={<IndexPCPage dispatch={this.dispatch} />} title={`我的屏蔽`} />;
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(Index);
