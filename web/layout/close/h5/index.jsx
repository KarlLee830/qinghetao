
import React from 'react';
import styles from './index.module.scss';
import Header from '@components/header';
import {Button} from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import LoginHelper from '@common/utils/login-helper';

@inject('site')
@observer
class H5CloseSite extends React.Component {
  render() {
    const { site } = this.props;
    const { closeSiteConfig } = site;
    return (
      <div className={styles.page}>
        <Header/>
        <img alt="图片" className={styles.img} src='/dzq-img/close.png'/>
        <h1 className={styles.main}>站点已关闭</h1>
        {closeSiteConfig && <p className={styles.sub}>{closeSiteConfig.detail}</p>}
        {false && <div className={styles.fixedBox}>
          <Button onClick={LoginHelper.saveAndLogin} size='large' className={styles.btn} type='primary'>管理员登录</Button>
        </div>}
      </div>
    );
  }
}


export default H5CloseSite;