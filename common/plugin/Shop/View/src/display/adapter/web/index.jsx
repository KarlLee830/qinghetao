import React from 'react';
import { Icon, Dialog } from '@discuzqsdk/design';
import { MINI_SHOP_TYPE, PLATFORM_SHOP_TYPE } from '@common/plugin/Shop/View/src/common';
import styles from '../index.module.scss';
import classNames from 'classnames';

export default class ShopDisplay extends React.Component {
  handleBuy = (data, type) => {
    const { detailContent, detailQrcode, title } = data || {};
    const { siteData } = this.props;
    if (type === PLATFORM_SHOP_TYPE) window.open(detailContent);
    if (type === MINI_SHOP_TYPE) {
      const imgRender = (
        <>
          <div className={styles['dialog-subtitle']}>扫码查看商品详情</div>
          <div className={styles['dialog-image-wrapper']}>
            <img className={styles['dialog-image']} src={detailQrcode} title={title} alt={title} />
          </div>
        </>
      );
      Dialog.info({
        className: styles.dialog,
        isNew: true,
        title: '购买商品',
        content: imgRender,
        width: siteData.platform === 'h5' ? 285 : 400,
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
        <div className={styles.wrapper} key={data?.id} onClick={() => this.handleBuy(data, type)}>
          <div className={styles['wrapper-left']}>
            <img
              className={styles['wrapper-left_left']}
              src={data?.imagePath}
              title={data?.title}
              alt={data?.title}
            />
            <div className={styles['wrapper-left_right']}>
              <div className={styles['wrapper-left_right_title']}>
                {data?.title}
              </div>
              <div className={styles['wrapper-left_right_price']}>
                {data?.price}
              </div>
            </div>
          </div>
          {type === MINI_SHOP_TYPE && (
            <div
              className={classNames(styles['wrapper-right'], styles['wrapper-platform'])}
            >
              <Icon size="20" name="ShoppingCartOutlined" />
              <div className={styles['wrapper-right_footer']}>
                购买商品
              </div>
            </div>
          )}
        </div>
      );
    });
  }
}
