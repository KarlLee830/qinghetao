
import React from 'react';
import styles from './index.module.scss';
import Header from '@components/header';
import {Button} from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import isServer from '@common/utils/is-server';
import Copyright from '@components/copyright';
import LoginHelper from '@common/utils/login-helper';

@inject('site')
@observer
class PCCloseSite extends React.Component {
  constructor(props) {
    super(props);
    this.goBackClickHandle = this.goBackClickHandle.bind(this);
  }
  goBackClickHandle() {
      window.history.length <= 1 ? Router.redirect({ url: '/' }) : Router.back();
  }
  render() {
    const { site } = this.props;
    const { closeSiteConfig } = site;
    const height = isServer() ? '100vh' : `${window.innerHeight - 160}px`;
    return (
      <div className={styles.body}>
        <Header/>
        <div className={styles.page} style={{height: height}}>
          <img alt="图片" className={styles.img} src='/dzq-img/close.png'/>
          <h1 className={styles.main}>站点已关闭</h1>
          {closeSiteConfig && <p className={styles.sub}>{closeSiteConfig.detail}</p>}
          {false && <Button onClick={LoginHelper.saveAndLogin} size='large' className={styles.btn} type='primary'>管理员登录</Button>}
        </div>
        <Copyright center line/>
      </div>
      
    );
  }
}


export default PCCloseSite;