import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import Header from '@components/header';
import isServer from '@common/utils/is-server';
import Router from '@discuzqsdk/sdk/dist/router';

@observer
class PCNoInstallPage extends React.Component {
  constructor(props) {
    super(props);
    this.goBackClickHandle = this.goBackClickHandle.bind(this);
  }
  goBackClickHandle() {
      window.history.length <= 1 ? Router.redirect({ url: '/' }) : Router.back();
  }
  render() {
    const height = isServer() ? '100vh' : `${window.innerHeight - 160}px`;
    return (
      <div className={styles.body}>
        <Header/>
        <div className={styles.page} style={{height: height}}>
          <img alt="图片" className={styles.img} src='/dzq-img/error.png'/>
          <p className={styles.text}>站点未安装！</p>
        </div>
      </div>
      
    );
  }
}


export default PCNoInstallPage;
