import React, { useCallback } from 'react';
import { inject, observer } from 'mobx-react';
import { Toast } from '@discuzqsdk/design';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import FilterRichText from '@components/filter-rich-text'
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import goToLoginPage from '@common/utils/go-to-login-page';
import SiteMapLink from '@components/site-map-link';
/**
 * 置顶消息
 * @prop {{prefix:string, title:string}[]} data
 */
const TopNews = ({ data = [], router, platform = 'h5', user = null}) => {
  const onClick = (item, event) => {
    event.stopPropagation();
    
    const { threadId } = item || {};
    if (event?.target?.localName === 'a') {
      return
    }
    if (!allowEnter(item)) return;
    router.push(`/thread/${threadId}`);
    return false;
  };

  // 判断能否进入详情逻辑
  const allowEnter = (item) => {
    if (!item?.canViewPosts) {
      const isLogin = user.isLogin();
      if (!isLogin) {
        Toast.info({ content: '请先登录!' });
        goToLoginPage({ url: '/user/login' });
      } else {
        Toast.info({ content: '暂无权限查看详情，请联系管理员' });
      }
      return false;
    }
    return true;
  }

  const handlerTitle = (title = '') => {
    if (platform = 'h5' && title.length > 20) {
      return `${title.slice(0, 20)}...`
    }
    return title
  }
  
  return (
    <div className={`${styles.list} top-news`}>
      {data?.map((item, index) => (
        <div key={index}>
          <SiteMapLink href={`/thread/${item.threadId}`} text={item.title}/>
          <div
            key={index}
            className={`top-news-item ${styles.item} ${platform === 'pc' ? styles.itemPC : styles.itemH5}`}
            onClick={(event) => onClick(item, event)}
          >
            <div className={styles.prefix}>{item.prefix || '置顶'}</div>
            {false && <div className={styles.title}>{handlerTitle(item.title)}</div>}
            <div className={styles.title}>
              <FilterRichText 
                onClick={(event) => onClick(item, event)} className={styles.richText} content={item.title}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default inject('user')(observer(withRouter(TopNews)));
