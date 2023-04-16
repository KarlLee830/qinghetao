import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import Header from '@components/header';
import {Button} from '@discuzqsdk/design';
import isServer from '@common/utils/is-server';
import Router from '@discuzqsdk/sdk/dist/router';
import Copyright from '@components/copyright';

@observer
class PC400Page extends React.Component {
  constructor(props) {
    super(props);
    this.goBackClickHandle = this.goBackClickHandle.bind(this);
  }
  goBackClickHandle() {
      window.history.length <= 1 ? Router.redirect({ url: '/' }) : Router.back();
  }

  render() {
    const height = isServer() ? '100vh' : `${window.innerHeight - 200}px`;
    return (
      <div className={styles.body}>
        <Header/>
        <div className={styles.page} style={{height: height}}>
          <img className={styles.img} src='/dzq-img/404.png'/>
          <p className={styles.text}>您要访问的页面可能已被删除、已更改名称或暂时不可用</p>
          <Button onClick={this.goBackClickHandle} size='large' className={styles.btn} type='primary'>返回上一页</Button>
        </div>
        <Copyright center line/>
      </div>
    );
  }
}


export default PC400Page;
