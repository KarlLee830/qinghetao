import React from 'react';
import styles from './index.module.scss';
import {Icon,Button} from '@discuzqsdk/design'
import Header from '@components/header';
import Copyright from '@components/copyright';
import Router from '@discuzqsdk/sdk/dist/router';

export default function ErrorPage() {

  const onReflush = ()=>{
    window.location.href = '/';
  }


  return (
    <div className={styles.page}>
      <Header></Header>

      <div className={styles.body}>
      <img className={styles.icon} src='/dzq-img/error.png'/>
      <span className={styles.text}>客户端错误 请报告官方团队</span>
      <Button onClick={onReflush} className={styles.button} type='primary'>回到首页</Button>
      </div>

      <div className={styles.footer}>
        <Copyright></Copyright>
      </div>
    </div>
  );
}
