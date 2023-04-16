import React from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import { get } from '@common/utils/get';
import { numberFormat } from '@common/utils/number-format';

/**
 * 帖子头部
 * @prop {string} bgColor 背景颜色
 * @prop {boolean} hideInfo 隐藏站点信息
 */

 @inject('site')
 @observer
class JoinBanner extends React.Component {
  static defaultProps = {
    isShowData: false
  }

  getBgHeaderStyle() {
    const { site: { webConfig = {} } } = this.props;
    const siteBackgroundImage = get(webConfig, 'setSite.siteBackgroundImage', '');

    if (siteBackgroundImage) {
      return { backgroundImage: `url(${siteBackgroundImage})` };
    }
  }

  render() {
    const { site: { webConfig = {} }, isShowData } = this.props;
    const siteAuthor = get(webConfig, 'setSite.siteAuthor.username', '');
    const siteInstall = get(webConfig, 'setSite.siteInstall', '');
    const siteHeaderLogo = get(webConfig, 'setSite.siteHeaderLogo', '');
    // 兼容ios
    const [siteTimer] = siteInstall.split(' ');
    const startDate = Date.parse(siteTimer);
    const endDate = Date.parse(new Date());
    const createDays = numberFormat(parseInt(Math.abs(startDate  -  endDate) / 1000 / 60 / 60 / 24, 10));

    return (
      <div className={styles.content_header} style={{...this.getBgHeaderStyle()}}>
        <img
            className={styles.logo}
            mode="aspectFit"
            src={siteHeaderLogo || '/dzq-img/join-banner-bg.png'}
            alt="图片"
        />
        {
          isShowData
          && <ul className={styles.joinInfo}>
              <li className={styles.item}>
                <span className={styles.text}>站长</span>
                <span className={styles.content}>{siteAuthor || '--'}</span>
              </li>
              <li className={styles.item}>
                <span className={styles.text}>已创建</span>
                <span className={styles.content}>{createDays || 0}天</span>
              </li>
            </ul>
        }
      </div>
    );
  }
}

export default JoinBanner;
