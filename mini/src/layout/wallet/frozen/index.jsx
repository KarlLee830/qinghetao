import React from 'react';
import { inject, observer } from 'mobx-react';
import { View, Text } from '@tarojs/components';
import List from '@components/list';
import { time } from '@discuzqsdk/sdk/dist/index';
import { diffDate } from '@common/utils/diff-date';
import styles from './index.module.scss';
import RichText from '@discuzqsdk/design/dist/components/rich-text/index';
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
      height: '100vh',
    };
  }

  async componentDidMount() {
    const { getUserWalletInfo } = this.props.wallet;
    await getUserWalletInfo();
    this.fetchFreezeDetail();
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
      <View className={styles.container}>
        {/* <Header></Header> */}
        <List
          onRefresh={this.fetchFreezeDetail}
          noMore={this.state.page > this.state.totalPage}
          hasOnScrollToLower={true}
          height={this.state.height}
          showLoadingInCenter={!this.listRenderDataFilter().length}
        >
          <View className={styles.header}>
            <View className={styles.record}>共有{this.state.totalCount}条记录</View>
            {/* TODO: 后台未返回涉及金额字段 */}
            <View className={styles.totalMoney}>
              涉及金额 <Text className={styles.totalMoneyNumber}>{this.props.wallet.walletInfo.freezeAmount} 元</Text>
            </View>
          </View>
          <View className={styles.body}>
            {this.listRenderDataFilter().map((value) => (
              <View className={styles.content} key={value.id}>
                <View className={styles.upper}>
                  <View className={styles.normalText}>
                    <RichText content={this.parseHTML(value.changeDesc || value.title)} />
                  </View>
                  {/* <View className={styles.title}>{value.title || value.changeDesc}</View> */}
                  <View className={styles.amount}>{value.amount}</View>
                </View>
                <View className={styles.lower}>
                  <View>{time.formatDate(value.createdAt, 'YYYY-MM-DD HH:mm')}</View>
                  <View>
                    ID: <Text>{value.id}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </List>
      </View>
    );
  }
}

export default FrozenAmount;
