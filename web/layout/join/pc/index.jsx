import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';

@inject('site')
@observer
class PCCloseSite extends React.Component {
  render() {
    const { site } = this.props;

    return (
      <div className={styles.page}>
        <h1 className={styles.main}>加入站点</h1>
      </div>
    );
  }
}


export default PCCloseSite;
