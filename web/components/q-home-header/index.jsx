import React from 'react';
import styles from './index.module.scss';
import { Icon, Toast } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import SharePopup from '../thread/share-popup';
import isWeiXin from '@common/utils/is-weixin';
import { get } from '@common/utils/get';
import h5Share from '@discuzqsdk/sdk/dist/common_modules/share/h5';
import goToLoginPage from '@common/utils/go-to-login-page';
import { numberFormat } from '@common/utils/number-format';
import LoginHelper from '@common/utils/login-helper';
import MorePopop from '@components/more-popop';
// 搜索
import QSearchInputLv from '@components/q-search-input-lv';
// 图标
import { UserOutlined, FileTextOutlined } from '@ant-design/icons';
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
  Aurl = () => {
    // this.props.onClickTab(3);
	  window.location.href = '/my';
  }
  Burl = () => {
    window.location.href = '/';
  }
  onSearch = (keyword) => {
    const { value = '' } = this.state;
    const { onSearch } = this.props;
    if (!onSearch) {
      Router.push({ url: `/search/result-post?keyword=${keyword}` });
    } else {
      onSearch(value);
    }
  };
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
      : { background: '#fff' }
    );
  }


  getSiteInfo() {
    const { site } = this.props;
    const { webConfig } = site;

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
    const title = document?.title || '';
    h5Share(title);
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
  componentDidMount() {
    this.setState({ loadWeiXin: isWeiXin() });
    if (this.domRef.current) {
      this.setState({ height: this.domRef.current.clientHeight });
    }
  }

  render() {
	const { keyword } = this.state;
    const { bgColor, hideInfo = false, style = {}, digest = null, mode = '', site } = this.props;
    const { visible, loadWeiXin } = this.state;


    return (
      <div ref={this.domRef}
        className={`${styles.container} ${mode ? styles[`container_mode_${mode}`] : ''}`}
      >
        <div className={styles.toubu}>
		  <div onClick={this.Burl} className={styles.logotuzuo}>
		    <img
		        className={styles.logo}
		        mode="aspectFit"
		        src={site?.webConfig?.setSite?.siteFavicon}
		    />
		  </div>
		  <div className={styles.zhongbu}>
          <QSearchInputLv onSearch={this.onSearch} onCancel={this.onCancel} defaultValue={keyword} isShowBottom={false} searchWhileTyping/>
          </div>
		  <div onClick={this.Aurl} className={styles.logotuyou}>
        <div className={styles.logo}>
          <Icon name="PersonalOutlined" size={30} />
        </div>
		  </div>
		</div>
        {loadWeiXin && <SharePopup visible={visible} onClose={this.onClose} />}
      </div>
    );
  }
 }

export default HomeHeader;
