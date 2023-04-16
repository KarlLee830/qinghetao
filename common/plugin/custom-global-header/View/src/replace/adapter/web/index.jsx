import styles from '../index.module.scss';
import { Icon, Input, Button, Dropdown, Avatar } from '@discuzqsdk/design';
import { useState } from 'react';
import UnreadRedDot from './unread-red-dot';
import LocalBridge from '@discuzqsdk/sdk/dist/localstorage';

const setCookie = (name, value, exdays) => {
  if (parseInt(exdays)) {
    const exp = new Date();
    exp.setTime(exp.getTime() + exdays * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${exp.toGMTString()};path=/;`;
    return;
  }
  document.cookie = `${name}=${value};path=/;`;
};

export default function (props) {
  const { dzqRouter, isLogin, userInfo, renderData, onSearch, pluginStore } = props;
  const { totalUnread } = renderData || {};

  const [value, setValue] = useState(pluginStore?.searchValue || '');

  const handleRouter = (path) => {
    dzqRouter?.router.push(path);
  };

  const dropdownUserUserCenterActionImpl = () => {
    handleRouter('/my');
  };

  const dropdownUserLogoutActionImpl = () => {
    const localBridgeOptions = { prefix: '' };
    const locals = new LocalBridge(localBridgeOptions);
    locals.remove('access_token');

    setCookie('access_token', '', -1);

    // handleRouter('/');
    window.location.replace('/');
  };

  const dropdownActionImpl = (action) => {
    if (action === 'userCenter') {
      dropdownUserUserCenterActionImpl();
    } else if (action === 'logout') {
      dropdownUserLogoutActionImpl();
    }
  };

  const handleSearch = () => {
    pluginStore && (pluginStore.searchValue = value);
    if (!onSearch) {
      handleRouter(`/search?keyword=${value}`);
    } else {
      onSearch(value);
    }
  };
  // 登录
  const toLogin = () => {
    handleRouter('/user/login');
  };
  const toRegister = () => {
    handleRouter('/user/register');
  };

  const renderHeaderLogo = () => {
    const { siteData: site } = props;

    if (site?.webConfig?.setSite?.siteLogo !== '') {
      return (
        <img
          alt="站点logo"
          className={styles.siteLogo}
          src={site?.webConfig?.setSite?.siteLogo}
          onClick={() => handleRouter('/')}
        />
      );
    }
    return (
      <img
        className={styles.siteLogo}
        alt="站点logo"
        src="/dzq-img/admin-logo-pc.png"
        onClick={() => handleRouter('/')}
      />
    );
  };

  const renderUserInfo = () => {
    // todo 跳转
    const { siteData: site } = props;
    if (userInfo && userInfo.id) {
      return (
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
          onChange={dropdownActionImpl}
        >
          <div className={styles.userInfo}>
            {/* onClick={this.handleUserInfoClick} */}
            <Avatar
              className={styles.avatar}
              name={userInfo.nickname}
              circle={true}
              image={userInfo?.avatarUrl}
              onClick={() => {}}
            ></Avatar>
            <p title={userInfo.nickname || ''} className={styles.userName}>
              {userInfo.nickname || ''}
            </p>
          </div>
        </Dropdown>
      );
    }

    return (
      <div className={styles.userInfo}>
        <Button className={styles.userBtn} type="primary" onClick={toLogin}>
          登录
        </Button>
        {site.isRegister && (
          <Button onClick={toRegister} className={`${styles.userBtn} ${styles.registerBtn}`}>
            注册
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={styles.customHeader}>
      <div className={styles.container}>
        <div className={styles.left}>{renderHeaderLogo()}</div>

        <div className={styles.center}>
          <div className={styles.iconList}>
            <div
              className={styles.iconItem}
              onClick={() => {
                handleRouter('/');
              }}
            >
              <Icon name="HomeOutlined" size={15} />
              <p className={styles.iconText}>首页</p>
            </div>
            {!props?.siteData?.webConfig?.other?.canViewThreads ? (
              <></>
            ) : (
              <div
                className={styles.iconItem}
                onClick={() => {
                  handleRouter('/search');
                }}
              >
                <Icon name="FindOutlined" size={17} />
                <p className={styles.iconText}>发现</p>
              </div>
            )}
            <div
              className={styles.iconItem}
              onClick={() => {
                handleRouter('/search/result-post');
              }}
            >
              <Icon name="HotBigOutlined" size={15} />
              <p className={styles.iconText}>热门内容</p>
            </div>
          </div>

          <div className={styles.search}>
            <Input
              icon="SearchOutlined"
              placeholder="搜索"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onIconClick={handleSearch}
              onEnter={handleSearch}
            ></Input>
          </div>
        </div>

        {isLogin() && (
          <div className={styles.message} onClick={() => handleRouter('/message')}>
            <UnreadRedDot unreadCount={totalUnread}>
              <Icon name="MailOutlined" size={17} />
            </UnreadRedDot>
          </div>
        )}

        <div className={styles.userInfo}>{renderUserInfo()}</div>
      </div>
    </div>
  );
}
