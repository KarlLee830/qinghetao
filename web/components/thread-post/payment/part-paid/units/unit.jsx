import React from 'react';
import '../../index.module.scss';
import styles from '@components/thread-post/payment/index.module.scss';
import { Divider } from '@discuzqsdk/design';

// 容器
const Unit = ({ className = '', children, title, desc, rightActionRender = null, withoutDivider = false }) => (
  <div className={`${styles['paid-unit']} ${className}`}>
    {!withoutDivider && <Divider />}

    {/* 内容区首*/}
    <div className={styles['paid-item']}>
      <div className={styles.left}>{title}</div>
      {rightActionRender && <div className={styles.right}>{rightActionRender()}</div>}
    </div>

    {/* 描述区*/}
    {desc && <div className={styles['paid-unit-desc']}>{desc}</div>}

    {/* 内容渲染区*/}
    {children}
  </div>
);

export default Unit;
