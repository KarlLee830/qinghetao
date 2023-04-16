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
    const { site, updataTime, threadTotal } = this.props;
    const { platform } = site;
    // 站点介绍
    return (
      <div className={layout.wrap}>
        <div className={`${layout.site} ${platform === 'pc' && layout.pc_site}`}>
          <SectionTitle titleStyle={platform === 'pc' ? { padding: '24px 0' } : {}} isShowMore={false} icon={{ color: '#2469F6', name: 'IntroduceOutlined' }} title="站点介绍" onShowMore={this.redirectToSearchResultUser} />
          <div className={`${layout.site_introduce} ${platform === 'h5' && layout.h5_bottom_border}`}>
            {site.siteIntroduction}
          </div>
        </div>
        {
          platform === 'h5'
            ? (
              <div className={layout.site_status}>
                <div className={layout.site_status_list}>
                    <span className={layout.site_status_label}>更新</span>
                    {/* TODO：和产品确认，暂时写死 */}
                    {/* <span className={layout.site_status_item}>{(updataTime && getSiteUpdateTime(updataTime)) || '--'}</span> */}
                    <span className={layout.site_status_item}>刚刚</span>
                </div>
                <div className={layout.site_status_list}>
                    <span className={layout.site_status_label}>成员</span>
                    <span className={layout.site_status_item}>{numberFormat(site?.webConfig?.other?.countUsers)}</span>
                </div>
                <div className={layout.site_status_list}>
                    <span className={layout.site_status_label}>主题</span>
                    <span className={layout.site_status_item}>{numberFormat(threadTotal)}</span>
                </div>
              </div>
            )
            : <></>
        }
      </div>
    )
  }
}

export default SiteInfo;
