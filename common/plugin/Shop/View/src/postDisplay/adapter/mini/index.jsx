import React from 'react';
import Taro, { eventCenter, getCurrentInstance } from '@tarojs/taro';
import { View, Text, Image } from '@tarojs/components';
import { Icon } from '@discuzqsdk/design';
import classNames from 'classnames';
import styles from '../index.module.scss';

const MINI_SHOP_TYPE = 11;
const PLATFORM_SHOP_TYPE = 10;

export default class ShopCreateDisplay extends React.Component {
  constructor(props) {
    super(props);
  }

  $instance = getCurrentInstance();

  componentDidMount = () => {
    const onShowEventId = this.$instance.router.onShow;
    eventCenter.on(onShowEventId, this.onShow);
  }

  onShow = () => {
    const selectPagePluginData = this.props.pluginAction.get('shop');

    if (selectPagePluginData) {
      const { shopPluginData } = selectPagePluginData;
      if (shopPluginData && shopPluginData.postData && shopPluginData.postData.tomId) {
        this.props.updatePlugin(shopPluginData);

        // 消费掉后去除
        this.props.pluginAction.set('shop', {
          shopPluginData: null,
        });
      }
    }
  }

  // 删除指定 类别 或 id 的 商品
  deleteProductItem({ type, productId }) {
    const { renderData } = this.props;
    if (!renderData) return null;

    const { body = { products: [] } } = renderData;

    const { products } = body;

    const nextProducts = Array.from(products);

    nextProducts.forEach((product, idx) => {
      if (product.type === type) {
        if (product.type === PLATFORM_SHOP_TYPE) {
          nextProducts.splice(idx, 1);
          return;
        }

        if (product.data.productId === productId) {
          nextProducts.splice(idx, 1);
          return;
        }
      }
    });


    if (nextProducts.length === 0) {
      this.props.deletePlugin();
      return;
    }

    this.props.updatePlugin({
      postData: {
        tomId: '61540fef8f4de8',
        body: {
          products: nextProducts,
        },
      },
    });
  }

  handleItemClick = () => {
    const currentPluginStore = this.props.pluginAction.get('shop');

    if (currentPluginStore) {
      this.props.pluginAction.set('shop', {
        ...currentPluginStore,
        renderData: this.props.renderData,
      });
    } else {
      this.props.pluginAction.set('shop', {
        renderData: this.props.renderData,
      });
    }

    Taro.navigateTo({ url: '/pluginPages/selectProduct/index' });
  }

  handlePlatformItemClick = () => {
    this.props.pluginAction.set('shop', {
      activeTab: 'platformShop',
    });
    this.handleItemClick();
  }

  handleMiniShopItemClick = () => {
    this.props.pluginAction.set('shop', {
      activeTab: 'miniShop',
    });
    this.handleItemClick();
  }

  renderMiniShopItem(product) {
    const { data: good } = product;
    return (
      <View
        className={styles.content}
        key={`${MINI_SHOP_TYPE}-${good.productId}`}
        onClick={this.handleMiniShopItemClick}
      >
        <View className={styles['content-left']}>
          <Image className={styles.image} src={good.imagePath} alt={good.title} />
        </View>
        <View className={styles['content-right']}>
          <View className={styles['content-title']}>{good.title}</View>
          <View className={styles['content-price']}>￥{good.price}</View>
          <View
            className={styles['delete-icon']}
            onClick={(e) => {
              e.stopPropagation();
              this.deleteProductItem({
                type: MINI_SHOP_TYPE,
                productId: good.productId,
              });
            }}
          >
            <Icon name="DeleteOutlined" size={16} color="#8590A6" />
          </View>
        </View>
      </View>
    );
  }

  renderPlatformItem(product) {
    const { data: good } = product;

    return (
      <View className={styles.content} key={`${PLATFORM_SHOP_TYPE}-${good.id}`} onClick={this.handlePlatformItemClick}>
        <View className={styles['content-left']}>
          <Image className={styles.image} src={good.imagePath} alt={good.title} />
        </View>
        <View className={styles['content-right']}>
          <View className={styles['content-title']}>{good.title}</View>
          <View className={styles['content-price']}>￥{good.price}</View>
          <View
            className={styles['delete-icon']}
            onClick={(e) => {
              e.stopPropagation();
              this.deleteProductItem({
                type: PLATFORM_SHOP_TYPE,
                productId: good.id,
              });
            }}
          >
            <Icon name="DeleteOutlined" size={16} color="#8590A6" />
          </View>
        </View>
      </View>
    );
  }

  render() {
    const { renderData } = this.props;
    if (!renderData) return null;

    const { body = { products: [] } } = renderData;

    const { products } = body;

    return products.map((product) => {
      if (product.type === MINI_SHOP_TYPE) {
        return this.renderMiniShopItem(product);
      }

      if (product.type === PLATFORM_SHOP_TYPE) {
        return this.renderPlatformItem(product);
      }
    });
  }
}
