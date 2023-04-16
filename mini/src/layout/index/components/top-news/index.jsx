import React from 'react';
import { inject, observer } from 'mobx-react';
import Toast from '@components/toast';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import FilterRichText from '@components/filter-rich-text'
import { handleLink } from '@components/thread/utils'
import Router from '@discuzqsdk/sdk/dist/router';
import goToLoginPage from '@common/utils/go-to-login-page';

/**
 * 置顶消息
 * @prop {{prefix:string, title:string}[]} data
 */
 const TopNews = ({ data = [], router, platform = 'h5', user = null}) => {
  const onClick = (item, e, node) => {
    const { threadId } = item || {};
    e && e.stopPropagation();
    const {url, isExternaLink } = handleLink(node)
    if(isExternaLink) return

    if (url) {
      Router.push({url})
    } else {
      if (!allowEnter(item)) return;
      Router.push({url: `/indexPages/thread/index?id=${threadId}`});
    }
  };

  // 判断能否进入详情逻辑
  const allowEnter = (item) => {
    if (!item?.canViewPosts) {
      const isLogin = user.isLogin();
      if (!isLogin) {
        Toast.info({ content: '请先登录!' });
        goToLoginPage({ url: '/userPages/user/wx-auth/index' });
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
    <View className={styles.list}>
      {data?.map((item, index) => (
        <View
          key={index}
          className={`${styles.item} ${styles.itemH5}`}
          onClick={() => onClick(item)}
        >
          <Text className={styles.prefix}>{item.prefix || '置顶'}</Text>
          {false && <View className={styles.title}>{handlerTitle(item.title)}</View>}
          <View className={styles.title}>
            <FilterRichText
              onClick={(e, node) => onClick(item, e, node)} className={styles.richText} content={item.title}
            />
          </View>
        </View>
      ))}
    </View>
  );
};

export default inject('user')(observer(TopNews));
