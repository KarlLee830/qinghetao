import React, { useState, useCallback, useRef, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import styles from './index.module.scss';
import { Icon, Toast } from '@discuzqsdk/design';
import { noop } from '@components/thread/utils';
import { withRouter } from 'next/router';
import UnreadRedDot from '@components/unread-red-dot';
import { unreadUpdateInterval } from '@common/constants/message';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import LoginHelper from '@common/utils/login-helper';
import SiteMapLink from '@components/site-map-link';

import GlobalFooterHook from '@common/plugin-hooks/plugin_global@footer';

/**
 * BottomNavBar组件
 * @prop {boolean} placeholder 固定在底部时，是否在标签位置生成一个等高的占位元素
 * @prop {boolean} curr 常亮icon
 */

const BottomNavBar = ({
  router,
  user,
  fixed = true,
  placeholder = false,
  curr = 'home',
  onClick = noop,
  message,
  canPublish,
  site,
  index,
}) => {
  const { totalUnread, readUnreadCount } = message;
  const checkCurrActiveTab = useCallback(
    (curr, target) => {
      return curr === target;
    },
    [curr],
  );

  const [tabs, setTabs] = useState([
    { icon: 'HomeOutlined', text: '首页', active: checkCurrActiveTab(curr, 'home'), router: '/' },
    { icon: 'FindOutlined', text: '发现', active: checkCurrActiveTab(curr, 'search'), router: '/search' },
    { icon: 'PlusOutlined', router: '/thread/post' },
    { icon: 'MailOutlined', text: '消息', active: checkCurrActiveTab(curr, 'message'), router: '/message' },
    { icon: 'ProfessionOutlined', text: '我的', active: checkCurrActiveTab(curr, 'my'), router: '/my' },
  ]);

  // 轮询更新未读消息
  const timeoutRef = useRef();
  const updateUnreadMessage = () => {
    if (!user.id) return;
    readUnreadCount();
    timeoutRef.current = setTimeout(() => {
      updateUnreadMessage();
    }, unreadUpdateInterval);
  };

  useEffect(() => {
    updateUnreadMessage();
    return () => clearTimeout(timeoutRef.current);
  }, []);

  const handleClick = (event, i, idx) => {
    // 满足seo sitemap
    event.stopPropagation();
    event.preventDefault();
    if (i.router === '/thread/post') {
      const { permissions } = user;
      if (permissions && permissions.createThread && !permissions.createThread.enable) {
        Toast.info({ content: '您暂无发帖权限' });
        return;
      }
      if (!canPublish('comment')) {
        return;
      }
    }

    let url = i.router;
    const {categoryids = [],sequence=0 } = index.filter;
    if (i.router === '/') {
      LoginHelper.clear();

      if(categoryids?.length || sequence !== 0) {
        url = `/cate/${categoryids.join('_')}/seq/${sequence}` ;
      }
    }

    onClick(i, idx);
    const temp = [...tabs];
    if (i.text) {
      temp.find((i) => i.active).active = false;
      temp[idx].active = true;
      setTabs(temp);
    }

    router.push(url);
  };

  const component = (
    <>
      <div className={styles.footer} style={{ position: fixed ? 'fixed' : '' }}>
        {tabs.map((i, idx) =>
          i.text ? (
            <React.Fragment key={idx}>
              <SiteMapLink href={i.router} text={i.text} />
              <div
                key={idx}
                className={styles.item + (i.active ? ` ${styles.active}` : '')}
                onClick={(e) => handleClick(e, i, idx)}
              >
                {i.icon === 'MailOutlined' ? (
                  <UnreadRedDot dotStyle={{ top: '-6px' }} unreadCount={totalUnread}>
                    <Icon name={i.icon} size={20} />
                  </UnreadRedDot>
                ) : (
                  <Icon name={i.icon} size={20} />
                )}
                <div className={styles.text}>{i.text}</div>
              </div>
            </React.Fragment>
          ) : (
            <React.Fragment key={idx}>
              <SiteMapLink href={i.router} text="发帖" />
              <div key={idx} className={styles.addIconWrapper} onClick={(e) => handleClick(e, i, idx)}>
                <div className={styles.addIcon}>
                  <Icon name={i.icon} size={28} color="#fff" />
                </div>
              </div>
            </React.Fragment>
          ),
        )}
      </div>
      {fixed && placeholder && <div className={styles.placeholder} />}
    </>
  );

  return (
    <GlobalFooterHook
      component={component}
      renderData={{ totalUnread }}
    ></GlobalFooterHook>
  );
};

export default HOCFetchSiteData(withRouter(inject('site', 'index', 'user', 'message')(observer(BottomNavBar))));
