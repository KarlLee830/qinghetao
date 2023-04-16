import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { Button, Icon, Toast } from '@discuzqsdk/design';
import Header from '@components/header';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import { numberFormat } from '@common/utils/number-format';
import renewPay from '@common/pay-bussiness/renew-pay';

@inject('site')
@inject('user')
@observer
class RenewalFee extends Component {
  handleRenewPay = async () => {
    const sitePrice = this.props.site?.sitePrice;
    const siteName = this.props.site?.siteName;
    const userStore = this.props.user;
    const siteStore = this.props.site;
    try {
      await renewPay({ sitePrice, siteName, userStore, siteStore });
    } catch (error) {
      console.error(error);
    }
  };

  render() {
    const { siteBackgroundImage: bgImage } = this.props.site;

    return (
      <div className={styles.renewalFeeWrapper}>
        <Header />
        <div className={styles.renewalFeeContent}>
          <div className={`${styles.siteBg} ${!bgImage && styles.defaultSiteBg}`} >
            <img
              src={bgImage || '/dzq-img/admin-logo-x2.png'}
              className={styles.siteBgImage}
              alt="图片"
            />
          </div>
          <div className={styles.menuInfo}>
            <div className={styles.menuItem}>
              <div className={styles.menuTitle}>站点名称</div>
              <div className={styles.menuValue}>{this.props.site?.siteName}</div>
            </div>
            <div className={styles.menuItem}>
              <div className={styles.menuTitle}>站长</div>
              <div className={styles.menuValue}>
                {this.props.site?.siteAuthor?.nickname || this.props.site?.siteAuthor?.username}
              </div>
            </div>
            <div className={styles.menuItem}>
              <div className={styles.menuTitle}>更新</div>
              <div className={styles.menuValue}>刚刚</div>
            </div>
            <div className={styles.menuItem}>
              <div className={styles.menuTitle}>成员</div>
              <div className={styles.menuValue}>{numberFormat(this.props.site?.countUsers)}</div>
            </div>
            <div className={styles.menuItem}>
              <div className={styles.menuTitle}>主题</div>
              <div className={styles.menuValue}>{this.props.site?.countThreads}</div>
            </div>
            <div className={styles.menuItem}>
              <div className={styles.menuTitle}>有效期</div>
              <div className={styles.menuValue}>{this.props.site?.siteExpire}天</div>
            </div>
          </div>
          {!this.props.user?.isIndefiniteDuration && (
            <div className={styles.feeBtn}>
              <Button type="primary" className={styles.btn} onClick={this.handleRenewPay}>
                ￥{this.props.site?.sitePrice} 立即续费
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default HOCFetchSiteData(RenewalFee);
