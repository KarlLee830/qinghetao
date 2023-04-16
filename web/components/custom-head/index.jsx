import React from 'react';
import { inject, observer } from 'mobx-react';
import { get } from '@common/utils/get';
import Head from 'next/head';
import { evalScript } from './utils';


// 默认取站点配置，当有特殊配置时，通过传入title和keywords可以组合和替换

@inject('site')
@observer
class CustomHead extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // 添加统计
    const siteStat = this.props.site?.webConfig?.setSite?.siteStat || '';
    evalScript(siteStat);
  }

  formatTitle() {
    const { site, title, showSiteName = true } = this.props;
    const base = showSiteName ? get(site, 'webConfig.setSite.siteName', '欢迎您') : '';
    let renderTitle = base;
    if ( title && title !== '' ) {
      if ( renderTitle === '' ) {
        renderTitle = `${title}`
      } else {
        renderTitle = `${title} - ${renderTitle}`
      }
    }
    return renderTitle;
  }

  formatKeywords() {
    const { site, keywords } = this.props;
    const base = get(site, 'webConfig.setSite.siteKeywords', '欢迎您');
    let renderKeywords = base;
    if (keywords && keywords !== '') {
      renderKeywords = `${keywords} - ${renderKeywords}`;
    }
    return renderKeywords;
  }

  formatDescription() {
    const { site, description } = this.props;
    const base = get(site, 'webConfig.setSite.siteIntroduction', '欢迎您');
    let renderDescription = base;
    if (description && description !== '') {
      renderDescription = description;
    }
    return renderDescription;
  }


  render() {
    const ico = this.props.site?.webConfig?.setSite?.siteFavicon || '';
    return (
      <Head>
        <meta name="keywords" content={this.formatKeywords()} />
        <meta name="description" content={this.formatDescription()} />
        {ico && <link rel="icon" href={ico}></link>}
        <title>{this.formatTitle()}</title>
      </Head>
    );
  }
}

export default CustomHead;
