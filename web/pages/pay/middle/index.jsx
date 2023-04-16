import React from 'react';
import { Icon } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import getQueryString from '@common/utils/get-query-string';
import HomeHeader from '@components/home-header';
import styles from './index.module.scss';
import browser from '@common/utils/browser';
import locals from '@common/utils/local-bridge';

@inject('payBox')
@observer
class PayMiddlePage extends React.Component {
  componentDidMount = async () => {
    const link = getQueryString('link');
    const iframe = document.createElement('iframe');

    const payOrderOptions = locals.get('PAY_ORDER_OPTIONS');

    if (!link) return;

    // UC 浏览器使用 iframe 有兼容性问题，使用直接跳转
    if (browser.env('uc') || browser.env('safari')) {
      this.props.payBox.h5SureDialogVisible = true;
      this.props.payBox.visible = true;

      const h5IOSPaidFlag = locals.get('H5_IOS_PAID_FLAG');

      if (h5IOSPaidFlag !== 'true' && payOrderOptions) {
        locals.set('H5_IOS_PAID_FLAG', 'true');

        const parsedLink = decodeURIComponent(link);
        window.location.href = parsedLink;
      } else {
        window.close();
      }
    } else {
      const parsedLink = decodeURIComponent(link);
      iframe.style.display = 'none';
      iframe.setAttribute('src', parsedLink);
      iframe.setAttribute('sandbox', 'allow-top-navigation allow-scripts allow-same-origin');
      document.body.appendChild(iframe);
    }

    // FIXME: SSR下的情况，状态会丢失，需要寻找一种解决办法
    // CSR 的情况下，打开确认支付结果窗口
    iframe.onload = () => {
      this.props.payBox.h5SureDialogVisible = true;
      this.props.payBox.visible = true;
    };
  };

  render() {
    return (
      <div>
        <HomeHeader mode={'login'} hideInfo={true} />
        <div className={styles.payMiddlePagecontent}>
          <div className={styles.infoText}>
            <Icon name="FunnelOutlined" size={16} />
            正在拉起微信支付
          </div>
        </div>
      </div>
    );
  }
}

export default HOCFetchSiteData(PayMiddlePage);
