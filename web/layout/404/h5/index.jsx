import React from 'react';
import styles from './index.module.scss';
import Header from '@components/header';
import {Button} from '@discuzqsdk/design';
import Router from '@discuzqsdk/sdk/dist/router';
import Copyright from '@components/copyright';

class H5404Page extends React.Component {
  render() {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div>
            <Header/>
            <img alt="404" className={styles.img} src='/dzq-img/404.png'/>
            <p className={styles.text}>您要访问的页面可能已被删除、已更改名称或暂时不可用</p>
          </div>
          <Copyright />
        </div>
        <div className={styles.fixedBox}>
          <Button onClick={() => {Router.back()}} size='large' className={styles.btn} type='primary'>返回上一页</Button>
        </div>
      </div>
    );
  }
}


export default H5404Page;
