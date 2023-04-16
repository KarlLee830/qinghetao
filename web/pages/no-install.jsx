import React from 'react';
import { inject, observer } from 'mobx-react';
import IndexPCPage from '@layout/no-install/pc';
import IndexH5Page from '@layout/no-install/h5';
import getPlatform from '@common/utils/get-platform';
import isServer from '@common/utils/is-server';
import ViewAdapter from '@components/view-adapter';

@inject('site')
@observer
class Custom500 extends React.Component {
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
      title='服务器错误'
    />;
  }
}

export default Custom500;
