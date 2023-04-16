import React, { Component } from 'react'
import { inject, observer } from 'mobx-react';
import H5UserCenterEditHeader from './h5/index';
import PcUserCenterEditHeader from './pc/index';
@inject('site')
@inject('user')
@observer
export default class index extends Component {
  render() {
    const { site } = this.props;
    const { platform } = site;
    if (platform === 'pc') {
      return <PcUserCenterEditHeader />
    }
    return <H5UserCenterEditHeader />
  }
}
