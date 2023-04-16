import React from 'react';
import { inject, observer } from 'mobx-react';
import HomeHeader from '@components/home-header';
import List from '@components/list';
import BaseLayout from '@components/user-center-base-laout-pc';
import layout from './index.module.scss';

@inject('site')
@inject('index')
@inject('forum')
@inject('search')
@inject('user')
@inject('invite')
@observer
class PartnerInviteWrap extends React.Component {
  render() {
    const { site, children, renderRight, contentHeader } = this.props;
    const { platform } = site;
    if (platform === 'h5') {
      return (
        <List className={layout.page} allowRefresh={false} hideCopyright>
          <HomeHeader hideInfo mode='join'/>
          { children }
        </List>
      );
    }
    return (
    <BaseLayout
      right={ renderRight }
      contentHeader={ contentHeader }
      slideRight={ true }
    >
      { children }
    </BaseLayout>

    );
  }
}

export default PartnerInviteWrap;
