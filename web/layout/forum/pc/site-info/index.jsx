import React, { Component } from 'react'
import { inject } from 'mobx-react';
import layout from './index.module.scss';
import { get } from '@common/utils/get';
import SectionTitle from '@components/section-title'
import { numberFormat } from '@common/utils/number-format';
import { getSiteUpdateTime } from '@common/utils/get-site-uptade-time';

@inject('site')
@inject('forum')
class SiteInfo extends Component {

  render() {
    const { site } = this.props;
    // 站点介绍
    const siteIntroduction = get(site, 'webConfig.setSite.siteIntroduction', '');
    return (
      <div className={layout.site}>
        <SectionTitle isShowMore={false} icon={{ color: '#2469F6', name: 'IntroduceOutlined' }} title="站点介绍" onShowMore={this.redirectToSearchResultUser} />
        <div className={layout.site_introduce}>
          {siteIntroduction}
        </div>
      </div>
    )
  }
}

export default SiteInfo;
