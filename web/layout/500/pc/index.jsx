import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import Header from '@components/header';
import {Button} from '@discuzqsdk/design';
import isServer from '@common/utils/is-server';
import Router from '@discuzqsdk/sdk/dist/router';
import Copyright from '@components/copyright';
import { ERROR_PAGE_TIPS } from '@common/constants/site';

@inject('site')
@observer
class PC500Page extends React.Component {
  constructor(props) {
    super(props);
    this.goBackClickHandle = this.goBackClickHandle.bind(this);
  }
  goBackClickHandle() {
      window.history.length <= 1 ? Router.redirect({ url: '/' }) : Router.back();
  }
  render() {
    const height = isServer() ? '100vh' : `${window.innerHeight - 200}px`;
    const { site: { errPageType = '' } } = this.props;
    return (
      <div className={styles.body}>
        <Header/>
        <div className={styles.page} style={{height: height}}>
          <img alt="错误图片" className={styles.img} src='/dzq-img/error.png'/>
          <p className={styles.text}>{ (errPageType && ERROR_PAGE_TIPS[errPageType]) || '未知错误'}</p>
          <Button onClick={this.goBackClickHandle} size='large' className={styles.btn} type='primary'>回到首页</Button>
        </div>
        <Copyright center line/>
      </div>
      
    );
  }
}


export default PC500Page;
