import React from 'react';
import styles from './index.module.scss';
import {Icon,Button} from '@discuzqsdk/design'
import Header from '@components/header';
import Copyright from '@components/copyright';

export default function ErrorPage() {

  const onReflush = ()=>{
    window.location.href = '/';
  }

  return (
    <div className={styles.page}>
      <Header></Header>

      <div className={styles.body}>
      <img alt="图片" className={styles.icon} src='/dzq-img/error.png'/>
      <span className={styles.text}>客户端错误 请报告官方团队</span>
      </div>

      <div className={styles.footer}>
      <Button onClick={onReflush} className={styles.button} type='primary'>返回首页</Button>
      </div>
    </div>
  );
}
