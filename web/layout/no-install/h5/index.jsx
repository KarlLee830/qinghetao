import React from 'react';
import styles from './index.module.scss';
import Header from '@components/header';

class H5NoInstallPage extends React.Component {
  render() {
    return (
      <div className={styles.page}>
        <Header/>
        <img alt="图片" className={styles.img} src='/dzq-img/error.png'/>
        <p className={styles.text}>站点未安装！</p>
      </div>
    );
  }
}


export default H5NoInstallPage;
