import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexPCPage from '@layout/404/pc';
import IndexH5Page from '@layout/404/h5';
import getPlatform from '@common/utils/get-platform';
import isServer from '@common/utils/is-server';
import ViewAdapter from '@components/view-adapter';

@inject('site')
@observer
class Custom404 extends React.Component {
  constructor(props) {
    super(props);
    const platform = isServer() ? 'static' : getPlatform(window.navigator.userAgent);
    props.site.setPlatform(platform);
  }
  componentDidMount() {
    this.props.site.setPlatform(getPlatform(window.navigator.userAgent));
  }
  render() {
    return <ViewAdapter
      h5={<IndexH5Page />}
      pc={<IndexPCPage />}
      title='没有找到资源'
    />;
  }
}

export default Custom404;