import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { Icon, Input, Button, Dropdown } from '@discuzqsdk/design';
import Avatar from '@components/avatar';
import { withRouter } from 'next/router';
import goToLoginPage from '@common/utils/go-to-login-page';
import Router from '@discuzqsdk/sdk/dist/router';
import clearLoginStatus from '@common/utils/clear-login-status';
import UnreadRedDot from '@components/unread-red-dot';
import { unreadUpdateInterval } from '@common/constants/message';
import LoginHelper from '@common/utils/login-helper';
import SiteMapLink from '@components/site-map-link';

import GlobalHeaderHooks from '@common/plugin-hooks/plugin_global@header';

@inject('site')
@inject('user')
@inject('message')
@inject('forum')
@inject('search')
@inject('baselayout')
@observer
class Header extends React.Component {
  timeoutId = null;
  constructor(props) {
    super(props);

    const keyword = this.props.router.query.keyword || '';
    this.state = {
      value: keyword,
    };
  }

  // state = {
  //   value: ''
  // }

  // 轮询更新未读消息
  updateUnreadMessage() {
    if (!this.props.user.id) return;
    const {
      message: { readUnreadCount },
    } = this.props;
    readUnreadCount();
    this.timeoutId = setTimeout(() => {
      this.updateUnreadMessage();
    }, unreadUpdateInterval);
  }

  async componentDidMount() {
    this.updateUnreadMessage();
    try {
      await this.props.forum.setOtherPermissions();
    } catch (error) {
      console.log(error);
    }
  }

  // 卸载时去除定时器
  componentWillUnmount() {
    clearTimeout(this.timeoutId);
  }

  onChangeInput = (e) => {
    this.setState({
      value: e,
    });
  };

  handleSearch = (e) => {
    const { value = '' } = this.state;
    const { onSearch } = this.props;
    this.props.search.resetIndexData();
    this.props.baselayout.search = -1;
    if (!onSearch) {
      Router.push({ url: `/search?keyword=${value}` });
    } else {
      onSearch(value);
    }
  };

  handlePluginSearch = (value) => {
    const { onSearch } = this.props;
    this.props.search.resetIndexData();
    this.props.baselayout.search = -1;
    if (!onSearch) {
      Router.push({ url: `/search?keyword=${value}` });
    } else {
      onSearch(value);
    }
  };

  handleClickSearchIcon = () => {
    this.props.baselayout.search = -1;
    if (this.props.router.pathname.indexOf('/search') !== -1 && this.props.router.pathname.indexOf('/result-') === -1)
      return;
    this.props.search.resetIndexData();
    this.handleRouter('/search');
  };

  handleRouter = (url) => {
    if (url === '/search') {
      this.props.search.resetIndexData();
      this.props.baselayout.search = -1;
    }
    this.props.router.push(url);
  };
  // 登录
  toLogin = () => {
    goToLoginPage({ url: '/user/login' });
  };
  toRegister = () => {
    Router.push({ url: '/user/register' });
  };

  renderHeaderLogo() {
    const { site } = this.props;

    if (site?.webConfig?.setSite?.siteLogo !== '') {
      return (
        <img
          alt="站点logo"
          className={styles.siteLogo}
          src={site?.webConfig?.setSite?.siteLogo}
          onClick={() => LoginHelper.gotoIndex()}
        />
      );
    }
    return (
      <img
        className={styles.siteLogo}
        alt="站点logo"
        src="/dzq-img/admin-logo-pc.png"
        onClick={() => LoginHelper.gotoIndex()}
      />
    );
  }

  dropdownUserUserCenterActionImpl = () => {
    this.props.router.push('/my');
  };

  dropdownUserLogoutActionImpl = () => {
    clearLoginStatus();
    LoginHelper.gotoIndex();
  };

  dropdownActionImpl = (action) => {
    if (action === 'userCenter') {
      this.dropdownUserUserCenterActionImpl();
    } else if (action === 'logout') {
      this.dropdownUserLogoutActionImpl();
    }
  };

  renderUserInfo() {
    // todo 跳转
    const { user, site, forum, message: { totalUnread } } = this.props;
    if (user && user.userInfo && user.userInfo.id) {
      return (
		  <>
		    <div
				className={`${styles.iconItem} ${styles.you}`}
				onClick={() => this.handleRouter('/thread/post')}
				>
				<SiteMapLink href="/thread/post" text="发布" />
				
				{/*<p className={`${styles.iconText} ${styles.you}`}>发布</p>*/}
				<Button type="primary" circle={true}><Icon name="IncreaseOutlined"></Icon></Button>
		    </div>
		    
		    <div className={styles.border}></div>
			<Dropdown
			  style={{ display: 'inline-block' }}
			  menu={
				<Dropdown.Menu>
				  <Dropdown.Item id="userCenter">
					<span className={styles.headerDropMenuIcon}>
					  <Icon name="PersonalOutlined" size={15} />
					</span>
					个人中心
				  </Dropdown.Item>
				  <Dropdown.Item id="logout">
					<span className={styles.headerDropMenuIcon}>
					  <Icon name="SignOutOutlined" size={15} />
					</span>
					退出登录
				  </Dropdown.Item>
				</Dropdown.Menu>
			  }
			  placement="right"
			  hideOnClick={true}
			  trigger="hover"
			  onChange={this.dropdownActionImpl}
			>
			  
			  <div className={styles.userInfo}>
				{/* onClick={this.handleUserInfoClick} */}
				<Avatar
				  className={styles.avatar}
				  name={user.userInfo.nickname}
				  circle={true}
				  image={user.userInfo?.avatarUrl}
				  onClick={() => {}}
				></Avatar>
				<p title={user.userInfo.nickname || ''} className={styles.userName}>
				  {user.userInfo.nickname || ''}
				</p>
			  </div>
			  
			</Dropdown>
			<div className={styles.border}></div>
			<div className={styles.iconItem} onClick={() => this.handleRouter('/message')}>
				<UnreadRedDot unreadCount={totalUnread}>
				  <div className={styles.message}>
					<SiteMapLink href="/message" text="消息" />
					<Icon
					  onClick={() => {
						this.iconClickHandle('home');
					  }}
					  name="MailOutlined"
					  size={17}
					/>
					{/*<p className={styles.iconText}>消息</p>*/}
				  </div>
				</UnreadRedDot>
			</div>
		</>
      );
    }

    return (
      <div className={styles.userInfo}>
        <Button className={styles.userBtn} type="primary" onClick={this.toLogin}>
          登录
        </Button>
        {site.isRegister && (
          <Button onClick={this.toRegister} className={`${styles.userBtn} ${styles.registerBtn}`}>
            注册
          </Button>
        )}
      </div>
    );
  }

  iconClickHandle(type) {
    console.log(type);
  }

  render() {
    const {
      site,
      user,
      message: { totalUnread },
      forum,
    } = this.props;
    const { otherPermissions } = forum || {};

    const component = (
      <div className={styles.header}>
        <div className={styles.headerFixedBox}>
          <div className={styles.headerContent}>
            <div className={styles.left}>
              {this.renderHeaderLogo()}
              
            </div>
			<div className={styles.center}>
			  <div className={styles.inputBox}>
			    <Input
			      // 增加 name ，避免错误的自动补全
			      name="homeSearch"
			      placeholder="搜索"
			      icon="SearchOutlined"
			      value={this.state.value}
			      onEnter={this.handleSearch}
			      onChange={(e) => this.onChangeInput(e.target.value)}
			      onIconClick={this.handleSearch}
			    />
			  </div>
			  {/**/}
			  <div className={styles.iconList}>
			    <div className={styles.iconItem} onClick={() => LoginHelper.gotoIndex()}>
			      <SiteMapLink href="/" text="首页" />
			      <Icon
			        onClick={() => {
			          this.iconClickHandle('home');
			        }}
			        name="HomeOutlined"
			        size={15}
			      />
			      <p className={styles.iconText}>首页</p>
			    </div>
				
			    
			    {!otherPermissions?.canViewThreads ? (
			      <></>
			    ) : (
			      <div className={styles.iconItem} onClick={() => this.handleClickSearchIcon()}>
			        <SiteMapLink href="/search" text="发现" />
			        <Icon
			          onClick={() => {
			            this.iconClickHandle('home');
			          }}
			          name="FindOutlined"
			          size={17}
			        />
			        <p className={styles.iconText}>发现</p>
			      </div>
			    )}
				
				
			  </div>
			  
			</div>
			
            <div className={styles.right}>
			  
              {this.renderUserInfo()}
			  
            </div>
          </div>
        </div>
      </div>
    );

    return (
      <GlobalHeaderHooks
        component={component}
        renderData={{
          totalUnread,
        }}
        onSearch={value => this.handlePluginSearch(value)}
      ></GlobalHeaderHooks>
    );
  }
}

export default withRouter(Header);
