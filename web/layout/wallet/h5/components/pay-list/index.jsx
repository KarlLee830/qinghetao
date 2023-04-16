import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';

import Avatar from '@components/avatar';
import { diffDate } from '@common/utils/diff-date';
import { time } from '@discuzqsdk/sdk/dist/index';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import RichText from '@discuzqsdk/design/dist/components/rich-text/index';

import styles from './index.module.scss';

const PAY_STATUS_MAP = {
  0: '待付款',
  1: '已付款',
  2: '取消订单',
  3: '支付失败',
  4: '订单已过期',
  5: '部分退款',
  10: '全额退款',
  11: '异常订单',
};

@observer
class IncomeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.payStatus = true;
  }

  filterTag(html) {
    return html?.replace(/<(\/)?([beprt]|br|div)[^>]*>|[\r\n]/gi, '')
      .replace(/<img[^>]+>/gi, $1 => {
        return $1.includes('qq-emotion') ? $1 : "[图片]";
      });
  }

  // parse content
  parseHTML = (content) => {
    let t = xss(s9e.parse(this.filterTag(content)));
    t = (typeof t === 'string') ? t : '';
    return t;
  }

  render() {
    const { key, itemKey, dataLength } = this.props
    return (
      <div className={styles.container} key={key}>
        <div className={styles.content}>
          <RichText content={this.parseHTML(this.props.payVal.title || this.props.payVal.changeDesc)} onClick={this.handleContentClick} />
          <div className={styles.money}>{this.props.payVal.amount}</div>
        </div>
        {/* // FIXME:这里的结构有问题 怪怪的 所以只能用数组长度取消底部边框线 */}
        <div className={styles.footer} style={{borderBottom: itemKey === dataLength - 1 && 0}}>
          <div className={styles.time}>{time.formatDate(this.props.payVal.createdAt, 'YYYY-MM-DD HH:mm')}</div>
          <div className={`${this.props.payVal.status ? styles.payStatusTrue : styles.payStatusFalse}`}>
            {PAY_STATUS_MAP[this.props.payVal.status]}
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(IncomeList);
