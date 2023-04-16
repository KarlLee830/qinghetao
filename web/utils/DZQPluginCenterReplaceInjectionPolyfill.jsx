import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import DZQPluginCenterReplaceInjection from '@discuzqsdk/plugin-center/dist/components/DZQPluginCenterReplaceInjection';

// next对于node_modules内的inject在服务器构建时会报错，需要添加垫片才能正常引用

@inject('site')
@inject('user')
@inject('plugin')
@observer
export default class DZQPluginCenterReplaceInjectionPolyfill extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    // 为保证能正常触发mobx更新，需显式注入pluginComponent和__pluginStore
    const { plugin } = this.props;
    return (
      <DZQPluginCenterReplaceInjection
        __pluginStore={plugin.pluginStore}
        pluginComponent={plugin.pluginComponent}
        {...this.props}
      />
    );
  }
}
