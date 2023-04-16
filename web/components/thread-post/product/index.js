import React, { memo } from 'react';
import { useRouter } from 'next/router';
import { Icon } from '@discuzqsdk/design';
import styles from './index.module.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';

function ShowGood({ good, onDelete }) {
  return (
    <>
      <div className={styles.content}>
        <div className={styles['content-left']}>
          <img className={styles.image} src={good.imagePath} alt={good.title} />
        </div>
        <div className={styles['content-right']}>
          <p className={styles['content-title']}>{good.title}</p>
          <span className={styles['content-price']}>￥{good.price}</span>
          <div className={styles['delete-icon']} onClick={onDelete}>
            <Icon name="DeleteOutlined" size={16} color="#8590A6" />
          </div>
        </div>
      </div>
    </>
  );
}

function AddGood({ addGood }) {
  return (
    <div className={styles['good-add-box']} onClick={addGood}>
      <Icon name="PlusOutlined" size={16} color="#8590A6" />
      <span className={styles['good-add-text']}>添加商品</span>
    </div>
  );
}

const Product = (props) => {
  // state
  const router = useRouter();
  const { good = {} } = props;

  // 组件内处理函数：添加商品，router.push('去往添加商品页');
  const addGood = () => {
    router.push('thread/100');
  };
  const clsName = props.pc ? classNames(styles['post-good-box'], styles.pc) : styles['post-good-box'];

  return (
    <div className={clsName} onClick={e => e.stopPropagation()}>
      {/* 判断当前商品是否存在 */}
      {good.title ? <ShowGood {...props} /> : <AddGood addGood={() => addGood()} />}
    </div>
  );
};

Product.PropTypes = {
  good: PropTypes.object.isRequired,
  clear: PropTypes.func, // 清除商品
};

export default memo(Product);
