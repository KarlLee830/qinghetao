import React from 'react';
import { View, Image } from '@tarojs/components';
import { Icon, Toast } from '@discuzqsdk/design';
import { MINI_SHOP_TYPE, PLATFORM_SHOP_TYPE } from '@common/plugin/Shop/View/src/common';
import { setClipboardData, navigateToMiniProgram } from '@tarojs/taro';
import classNames from 'classnames';
import styles from '../index.module.scss';

export default class ShopDisplay extends React.Component {
  handleBuy = (data, type) => {
    if (type === PLATFORM_SHOP_TYPE) {
      setClipboardData({
        data: data?.detailContent,
        success: () => {},
      });
    }
    if (type === MINI_SHOP_TYPE) {
      const { appId, path } = data;
      navigateToMiniProgram({
        appId,
        path,
        fail: (error) => {
          if (error && error.errMsg && error.errMsg === 'navigateToMiniProgram:fail cancel') {
            // 用户点击了取消跳转按钮
          } else {
            Toast.info({ content: '跳转失败' });
          }
        },
      });
    }
  };

  render() {
    const { renderData } = this.props;
    if (!renderData) return null;
    const { body } = renderData || {};
    const { products } = body || {};
    return (products || []).map((item) => {
      const { data, type } = item;
      return (
        <View className={styles.wrapper} key={data?.id} onClick={() => this.handleBuy(data, type)}>
          <View className={styles['wrapper-left']}>
            <Image
              className={styles['wrapper-left_left']}
              src={data?.imagePath}
              title={data?.title}
              alt={data?.title}
            />
            <View className={styles['wrapper-left_right']}>
              <View className={styles['wrapper-left_right_title']}>
                {data?.title}
              </View>
              <View className={styles['wrapper-left_right_price']}>
                {data?.price}
              </View>
            </View>
          </View>
          {type === MINI_SHOP_TYPE && (
            <View
              className={classNames(styles['wrapper-right'], styles['wrapper-platform'])}
            >
              <Icon size="20" name="ShoppingCartOutlined" />
              <View className={styles['wrapper-right_footer']}>
                购买商品
              </View>
            </View>
          )}
        </View>
      );
    });
  }
}
