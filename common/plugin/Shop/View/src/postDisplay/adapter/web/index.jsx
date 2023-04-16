import React from 'react';
import { Icon } from '@discuzqsdk/design';
import styles from '../index.module.scss';
import EventBus from '../../../event';

const MINI_SHOP_TYPE = 11;
const PLATFORM_SHOP_TYPE = 10;

export default class ShopCreateDisplay extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
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

  handleMiniShopItemClick = () => {
    EventBus.dispatch('showMiniDialog');
  };

  handlePlatformItemClick = () => {
    EventBus.dispatch('showPlatformDialog');
  };

  renderMiniShopItem(product) {
    const { data: good } = product;
    return (
      <div
        className={styles.content}
        key={`${MINI_SHOP_TYPE}-${good.productId}`}
        onClick={this.handleMiniShopItemClick}
      >
        <div className={styles['content-left']}>
          <img className={styles.image} src={good.imagePath} alt={good.title} />
        </div>
        <div className={styles['content-right']}>
          <p className={styles['content-title']}>{good.title}</p>
          <span className={styles['content-price']}>￥{good.price}</span>
          <div
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
          </div>
        </div>
      </div>
    );
  }

  renderPlatformItem(product) {
    const { data: good } = product;

    return (
      <div className={styles.content} key={`${PLATFORM_SHOP_TYPE}-${good.id}`} onClick={this.handlePlatformItemClick}>
        <div className={styles['content-left']}>
          <img className={styles.image} src={good.imagePath} alt={good.title} />
        </div>
        <div className={styles['content-right']}>
          <p className={styles['content-title']}>{good.title}</p>
          <span className={styles['content-price']}>￥{good.price}</span>
          <div
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
          </div>
        </div>
      </div>
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
