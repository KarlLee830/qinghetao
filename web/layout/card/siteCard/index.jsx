import React from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import { Avatar } from '@discuzqsdk/design';
import classNames from 'classnames';
import calcCosImageQuality from '@common/utils/calc-cos-image-quality';

@inject('site')
@inject('user')
@inject('card')
@observer
class SiteCard extends React.Component {
  constructor(props) {
    super(props);
    this.content = React.createRef();
    this.state = {
      overMaxHeight: false,
    };
  }
  getSiteInfo() {
    const { site } = this.props;
    const { webConfig } = site;
    const siteInfo = {
      countUsers: 0,
      countThreads: 0,
    };
    if (webConfig && webConfig.other) {
      siteInfo.countUsers = webConfig.other.countUsers;
      siteInfo.countThreads = webConfig.other.countThreads;
    }
    return siteInfo;
  }
  getBgHeaderStyle(bgColor) {
    const { site } = this.props;
    const siteData = site.webConfig || {};

    if (siteData.setSite?.siteBackgroundImage) {
      return { backgroundImage: `url(${siteData.setSite.siteBackgroundImage})` };
    }
    return (bgColor
      ? { background: bgColor }
      : { background: '#2469f6' }
    );
  }
  logoImg = '/dzq-img/admin-logo-x2.png';
  getLogo() {
    const { site } = this.props;
    const siteData = site.webConfig || {};
    if (siteData.setSite?.siteHeaderLogo) {
      return `${siteData.setSite.siteHeaderLogo}?imageMogr2/cgif/10`;
    }
    return this.logoImg;
  }
  componentDidMount = () => {
    if (this.content.current.offsetHeight >= 1900) {
      this.setState({ overMaxHeight: true });
    }
  }
  render() {
    const { bgColor, style = {}, mode = '', site, user, card } = this.props;
    card.setImgReady();
    const { countUsers, countThreads } = this.getSiteInfo();
    const { userInfo } = user;
    const siteData = site.webConfig?.setSite || '';
    const { siteName } = siteData || '';
    let { siteIntroduction } = siteData;
    if (!siteIntroduction) {
      siteIntroduction = '来这里，发现更多精彩内容！';
    }
    let targetAvatarImage = userInfo?.avatarUrl;
    if (targetAvatarImage && targetAvatarImage !== '') {
      if (/(http|https):\/\/.*?(gif)/.test(targetAvatarImage)) {
        targetAvatarImage = calcCosImageQuality(targetAvatarImage, 'gif');
      } else {
        targetAvatarImage = calcCosImageQuality(targetAvatarImage, 'png', 5);
      }
    }
    return (
        <div>
          <div
              className={`${styles.container} ${mode ? styles[`container_mode_${mode}`] : ''}`}
              style={{ ...style, ...this.getBgHeaderStyle(bgColor) }}
          >
            <div className={styles.userInfoBox}>
              <Avatar
                  className={classNames(styles.customAvatar, styles.cursor)}
                  circle={true}
                  image={targetAvatarImage}
                  siz="primary"
                  text={userInfo.nickname && userInfo.nickname.substring(0, 1)}
                ></Avatar>
              <div className={styles.descBox}>
                <div className={styles.nickname}>
                  <span >{`${userInfo.nickname} 推荐`}</span>
                </div>
                <div className={styles.sitename}>
                  <span>{siteName}</span>
                </div>
              </div>
            </div>
            <div className={styles.logoBox}>
                <img
                  className={styles.logo}
                  mode="aspectFit"
                  src={this.getLogo()}
                  alt="图片"
                />
            </div>
            <ul className={styles.siteInfo}>
              <li className={styles.item}>
                <span className={styles.text}>成员</span>
                <span className={styles.content}>{countUsers}</span>
              </li>
              <li className={styles.item}>
                <span className={styles.text}>内容</span>
                <span className={styles.content}>{countThreads}</span>
              </li>
            </ul>
          </div>
          <div className={styles.contentBox} ref={this.content}>
            <div className={styles.contentHeader}>
              <div className={styles.contentHeaderImgBox}>
                <img alt="图片" src='/dzq-img/content-header.png' className={styles.contentHeaderImg}/>
              </div>
              <span className={styles.contentHeaderText}>站点介绍</span>
            </div>
            <div className={styles.line}></div>
            <div className={styles.contentText}>
              {siteIntroduction}
            </div>
            {this.state.overMaxHeight && (
            <div>
              <div className={styles.rectangleBox}>
                <img alt="图片" src='dzq-img/rectangle.png' className={styles.rectangle}/>
              </div>
              <div className={styles.lookmoreBox}>
                <img alt="图片" src='/dzq-img/look-more.jpg' className={styles.lookmoreImg}/>
              </div>
            </div>
            )}
          </div>
        </div>
    );
  }
}

export default SiteCard;
