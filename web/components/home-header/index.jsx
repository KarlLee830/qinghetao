import React from 'react';
import styles from './index.module.scss';
import { Icon, Toast } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import SharePopup from '../thread/share-popup';
import isWeiXin from '@common/utils/is-weixin';
import setUrlParam from '@common/utils/set-url-param';
import { get } from '@common/utils/get';
import h5Share from '@discuzqsdk/sdk/dist/common_modules/share/h5';
import goToLoginPage from '@common/utils/go-to-login-page';
import { numberFormat } from '@common/utils/number-format';
import LoginHelper from '@common/utils/login-helper';
import MorePopop from '@components/more-popop';

/**
 * 帖子头部
 * @prop {string} bgColor 背景颜色
 * @prop {boolean} hideInfo 隐藏站点信息
 */

 @inject('site')
 @inject('user')
 @inject('index')
 @observer
class HomeHeader extends React.Component {
  state = {
    visible: false,
    height: 180,
    loadWeiXin: false,
    show: false,
  }

  domRef = React.createRef(null)

  logoImg = '/dzq-img/admin-logo-x2.png';

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

  getLogo() {
    const { site } = this.props;
    const siteData = site.webConfig || {};
    if (siteData.setSite?.siteHeaderLogo) {
      return siteData.setSite.siteHeaderLogo;
    }
    return this.logoImg;
  }

  getSiteInfo() {
    const { site } = this.props;
    const { webConfig } = site;
    const siteInfo = {
      countUsers: 0,
      countThreads: 0,
      siteAuthor: '',
      createDays: 0,
    };
    if (webConfig && webConfig.other) {
      siteInfo.countUsers = webConfig.other.countUsers;
      siteInfo.countThreads = webConfig.other.countThreads;
    }
    const siteAuthor = get(webConfig, 'setSite.siteAuthor.username', '');
    const siteInstall = get(webConfig, 'setSite.siteInstall', '');
    // 兼容ios
    const [siteTimer] = siteInstall.split(' ');
    const startDate = Date.parse(siteTimer);
    const endDate = Date.parse(new Date());
    const days = numberFormat(parseInt(Math.abs(startDate  -  endDate) / 1000 / 60 / 60 / 24, 10));

    siteInfo.siteAuthor = siteAuthor;
    siteInfo.createDays = days;

    return siteInfo;
  }
  onClose = () => {
    this.setState({ visible: false });
  }
  onCancel = () => {
    this.setState({ show: false });
  }
  handleH5Share = () => {
    const { user } = this.props;
    const title = document?.title || '';
    h5Share({
      title,
      path: setUrlParam(`/${location.search}`, { inviteCode: user?.userInfo?.id || ''})
    });
    Toast.info({ content: '复制链接成功' });
    this.onCancel();
  }
  handleWxShare = () => {
    this.setState({ visible: true });
    this.onCancel();
  }
  handleClick = () => {
    const { user } = this.props;
    if (!user.isLogin()) {
      goToLoginPage({ url: '/user/login' });
      return;
    }
    this.setState({ show: true });
  }
  createCard = () => {
    Router.push({ url: '/card' });
  }
  handleExperience = () => {
    Router.push({ url: '/card?experience=1' });
  }
  componentDidMount() {
    this.setState({ loadWeiXin: isWeiXin() });
    if (this.domRef.current) {
      this.setState({ height: this.domRef.current.clientHeight });
    }
  }
  returnPage() {
    // 没有上一页时，直接返回首页
    if (window?.history?.state?.idx < 1) {
      LoginHelper.gotoIndex();
      return;
    }
    Router.back();
  }

  render() {
    const { bgColor, hideInfo = false, style = {}, digest = null, mode = '', site } = this.props;
    const { visible, loadWeiXin } = this.state;
    const { countUsers, countThreads, siteAuthor, createDays } = this.getSiteInfo();
    const siteHeaderLogo = get(site, 'webConfig.setSite.siteHeaderLogo', '');
    return (
      <div ref={this.domRef}
        className={`${styles.container} ${mode ? styles[`container_mode_${mode}`] : ''}`}
        style={{ ...style, ...this.getBgHeaderStyle(bgColor) }}
      >
        {hideInfo && mode !== 'join' && <div className={styles.topBar}>
          {
            mode === 'login'
              ? <div onClick={this.returnPage} className={styles.left}>
                  <Icon name="LeftOutlined" />返回
                </div>
              : <></>
          }
          <div>
            <Icon onClick={() => LoginHelper.gotoIndex()} name="HomeOutlined" color="#fff" size={20} />
          </div>
        </div>}
        {
          mode === 'join' && !siteHeaderLogo
            ? <div className={styles.joinLog}>
                <img
                    className={styles.logo}
                    mode="aspectFit"
                    src='/dzq-img/join-banner-bg.png'
                    alt="图片"
                />
              </div>
            : <div className={styles.logoBox}>
                <img
                    className={styles.logo}
                    mode="aspectFit"
                    src={this.getLogo()}
                    alt="图片"
                />
              </div>
        }
        {digest && <div className={styles.digest}>
            <div className={styles.left}>站长 {digest.admin}</div>
            <div className={styles.right}>已创建 {digest.day}天</div>
        </div>}
        {!hideInfo && <ul className={styles.siteInfo}>
          <li className={styles.item}>
            <span className={styles.text}>成员</span>
            <span className={styles.content}>{numberFormat(countUsers)}</span>
          </li>
          <li className={styles.item}>
            <span className={styles.text}>内容</span>
            <span className={styles.content}>{numberFormat(countThreads)}</span>
          </li>
          <li className={styles.item} onClick={this.handleClick}>
            <Icon className={styles.shareIcon} color="#fff" name="ShareAltOutlined"/>
            <span className={styles.shareText}>分享</span>
          </li>
        </ul>}
        <MorePopop
          show={this.state.show}
          site={this.props.site}
          user={this.props.user}
          onClose={this.onCancel}
          handleH5Share={this.handleH5Share}
          handleWxShare={this.handleWxShare}
          createCard={this.createCard}
          handleExperience={this.handleExperience}
        ></MorePopop>
        {
          mode === 'join' && <ul className={`${styles.siteInfo} ${styles.joinInfo}`}>
            <li className={styles.item}>
              <span className={styles.text}>站长</span>
              <span className={styles.content}>{siteAuthor}</span>
            </li>
            <li className={styles.item}>
              <span className={styles.text}>已创建</span>
              <span className={styles.content}>{createDays}天</span>
            </li>
          </ul>
        }
        {loadWeiXin && <SharePopup visible={visible} onClose={this.onClose} />}
      </div>
    );
  }
 }

export default HomeHeader;
