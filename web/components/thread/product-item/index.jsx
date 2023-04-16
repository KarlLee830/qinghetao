import React from 'react';

import styles from './index.module.scss';

/**
 * 单个商品内容展示
 * @prop {string}        image 商品图片
 * @prop {string}        title 商品名称
 * @prop {number|string} amount 商品价格
 * @prop {boolean}       loading
 */

const Index = ({ image, title, amount = 0, loading, className: _className = '', onClick }) => {
  const _title = !loading ? title || '暂无内容' : '内容加载中';

  return (
    <div className={`${styles.container} ${_className}`} onClick={onClick}>
      <img alt="图片" className={`${styles.image} ${!image ? styles.empty : ''}`} src={image} />
      <div className={styles.content}>
        <div className={styles.title}>{_title}</div>
        <div className={styles.amount}>¥{amount}</div>
      </div>
    </div>
  );
};

export default React.memo(Index);
