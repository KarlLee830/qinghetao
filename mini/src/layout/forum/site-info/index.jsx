import React, { Component } from 'react';
import { View } from '@tarojs/components';
import { inject } from 'mobx-react';
import layout from './index.module.scss';
import { get } from '@common/utils/get';
import SectionTitle from '@components/section-title';
import { numberFormat } from '@common/utils/number-format';
import { getSiteUpdateTime } from '@common/utils/get-site-uptade-time';

@inject('site')
@inject('forum')
class SiteInfo extends Component {
  render() {
    const { site, forum } = this.props;
    const countThreads = get(site.webConfig, 'other.countThreads', '');
    const { siteIntroduction } = site;

    return (
    <View className={layout.wrap}>
      <View className={layout.site}>
        <SectionTitle
          isShowMore={false}
          icon={{ color: '#2469F6', name: 'IntroduceOutlined' }}
          title="站点介绍"
          onShowMore={this.redirectToSearchResultUser}
        />
      <View className={layout.site_introduce}>{siteIntroduction}</View>
      </View>
        <View className={layout.site_status}>
          <View className={layout.site_status_list}>
            <View className={layout.site_status_label}>更新</View>
            <View className={layout.site_status_item}>
              {/* {updataTime && getSiteUpdateTime(updataTime)} {updataTime} */}
              刚刚
            </View>
          </View>
          <View className={layout.site_status_list}>
            <View className={layout.site_status_label}>成员</View>
            <View className={layout.site_status_item}>{numberFormat(site?.webConfig?.other?.countUsers)}</View>
          </View>
          <View className={layout.site_status_list}>
            <View className={layout.site_status_label}>主题</View>
            <View className={layout.site_status_item}>{numberFormat(countThreads)}</View>
          </View>
        </View>
      </View>
    );
  }
}

export default SiteInfo;
