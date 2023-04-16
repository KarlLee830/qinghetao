/* eslint-disable spaced-comment */
/* eslint-disable new-cap */
import React from 'react';
import { Spin } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import DZQPluginCenterInjectionPolyfill from '../../utils/DZQPluginCenterInjectionPolyfill';

const PageLoading = () => {
  return <Spin>页面加载中...</Spin>;
};

// 插件插槽埋入
/**DZQ->plugin->register<plugin_system@add_page_hook>**/

@inject('site')
@inject('user')
@inject('plugin')
@observer
class PagePlugin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pluginPath: `/${this.props.router.query.path.join('/')}`,
    };
  }

  componentDidUpdate(prevProps) {
    // when router path changed
    if (prevProps.router.asPath !== this.props.router.asPath) {
      this.props.router.reload();
    }
  }

  getTargetPlugin = () => (
    <DZQPluginCenterInjectionPolyfill
      target="plugin_system"
      hookName="add_page_hook"
      condition={(pluginInfo) => pluginInfo.path === this.state.pluginPath}
      loading={() => <PageLoading />}
    />
  );

  renderTargetPlugin = () => {
    const targetPlugins = this.getTargetPlugin();
    return targetPlugins;
  };

  render() {
    const { plugin } = this.props;

    return this.renderTargetPlugin();
  }
}

export default withRouter(HOCFetchSiteData(PagePlugin));
