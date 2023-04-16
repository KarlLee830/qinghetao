import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { time } from '@discuzqsdk/sdk/dist/index';
import { diffDate } from '@common/utils/diff-date';
import BaseLayout from '@components/base-layout';
import { RichText } from '@discuzqsdk/design';
import styles from './index.module.scss';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
@inject('wallet')
@observer
class FrozenAmount extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      page: 1,
      totalCount: 0,
      totalPage: 1,
    };
  }

  async componentDidMount() {
    const { getUserWalletInfo } = this.props.wallet;
    await getUserWalletInfo();
  }

  listRenderDataFilter = () => {
    if (Object.values(this.props.wallet.freezeDetail).length === 0) return [];
    return Object.values(this.props.wallet.freezeDetail).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  fetchFreezeDetail = async () => {
    const freezeRes = await this.props.wallet.getFreezeDetail({
      page: this.state.page,
    });
    const { totalCount, totalPage } = freezeRes;
    const pageData = {
      totalCount,
      totalPage,
    };
    if (this.state.page <= totalPage) {
      pageData.page = this.state.page + 1;
    }
    this.setState(pageData);

    return;
  };

  filterTag(html) {
    return html?.replace(/<(\/)?([beprt]|br|div|h\d)[^>]*>|[\r\n]/gi, '').replace(/<img[^>]+>/gi, ($1) => {
      return $1.includes('qq-emotion') ? $1 : '[图片]';
    });
  }

  // parse content
  parseHTML = (content) => {
    let t = xss(s9e.parse(this.filterTag(content)));
    t = typeof t === 'string' ? t : '';
    return t;
  };

  render() {
    return (
      <BaseLayout
        className={styles.container}
        immediateCheck
        onRefresh={this.fetchFreezeDetail}
        noMore={this.state.page > this.state.totalPage}
      >
        <div className={styles.header}>
          <div className={styles.totalMoney}>共有{this.state.totalCount}条记录</div>
          {/* TODO: 后台未返回涉及金额字段 */}
          <div className={styles.totalMoney}>
            涉及金额
            <span className={styles.num}>{this.props.wallet.walletInfo.freezeAmount}元</span>
          </div>
        </div>

        {this.listRenderDataFilter().map((value) => (
          <div className={styles.content} key={value.id}>
            <div className={styles.upper}>
              <div className={styles.normalText}>
                <RichText content={this.parseHTML(value.changeDesc || value.title)} />
              </div>
              {/* <div>{value.title || value.changeDesc}</div> */}
              <div className={styles.amount}>{value.amount}</div>
            </div>
            <div className={styles.lower}>
              <div>{time.formatDate(value.createdAt, 'YYYY-MM-DD HH:mm')}</div>
              <div>
                ID: <span>{value.id}</span>
              </div>
            </div>
          </div>
        ))}
      </BaseLayout>
    );
  }
}

export default withRouter(FrozenAmount);
