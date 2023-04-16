import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { diffDate } from '@common/utils/diff-date';
import styles from './index.module.scss';
import status from './status.module.scss';
import RenderList from '../../../../../components/renderList';
import {
  CASH_DETAIL_CONSTANTS,
  INCOME_DETAIL_CONSTANTS,
  PAY_STATUS_MAP,
} from '../../../../../../common/constants/wallet';
import { formatDate } from '@common/utils/format-date.js';
import time from '@discuzqsdk/sdk/dist/time';
import classNames from 'classnames';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import RichText from '@discuzqsdk/design/dist/components/rich-text/index';

const STATUS_MAP = {
  1: '待审核',
  2: '审核通过',
  3: '审核不通过',
  4: '待打款',
  5: '已打款',
  6: '打款失败',
};

@observer
class WalletInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  filterTag = (html) => {
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

  // 获取收入明细列
  getIncomeColumns = () => {
    const columns = [
      {
        title: '收入明细',
        key: 'detail',
        render: item => (
          <span title={item.title} className={styles.normalText}>
            <RichText content={this.parseHTML(item.title) || item.changeDesc || '暂无内容'} />
          </span>
        ),
      },
      {
        title: '收入类型',
        key: 'type',
        render: item => (
          <span title={item.changeDesc} className={styles.normalText}>
            {item.changeDesc || '暂无内容'}
          </span>
        ),
      },
      {
        title: '收入金额',
        key: 'amount',
        render: item => (
          <span title={`+${item.amount}` || 0.0} className={`${styles.incomeAmount}`}>
            {`+${item.amount}` || 0.0}
          </span>
        ),
      },
      {
        title: '收入时间',
        key: 'time',
        render: item => (
          <span title={time.formatDate(item.createdAt, 'YYYY-MM-DD HH:mm')} className={`${styles.timer}`}>
            {time.formatDate(item.createdAt, 'YYYY-MM-DD HH:mm')}
          </span>
        ),
      },
    ];
    return columns;
  };

  // 获取支出明细列
  getPayColumns = () => {
    const columns = [
      {
        title: '支出明细',
        key: 'detail',
        render: item => (
          <span title={item.title || '暂无内容'} className={styles.normalText}>
            <RichText content={this.parseHTML(item.title) || item.changeDesc || '暂无内容'} />
          </span>
        ),
      },
      {
        title: '支出类型',
        key: 'type',
        render: item => (
          <span title={item.changeDesc} className={styles.normalText}>
            {item.changeDesc || '暂无内容'}
          </span>
        ),
      },
      {
        title: '支出状态',
        key: 'status',
        render: (item) => {
          for (const key in PAY_STATUS_MAP) {
            if (Number(key) === item.status) {
              return (
                <span
                  className={classNames(styles.payStatus, {
                    [styles.wait]: item.status === 0,
                    [styles.remited]: item.status === 1,
                  })}
                >
                  {PAY_STATUS_MAP[key] || '暂无内容'}
                </span>
              );
            }
          }
        },
      },
      {
        title: '支出金额',
        key: 'amount',
        render: item => <span className={styles.payAmount}>{item.amount || 0.0}</span>,
      },
      {
        title: '支出时间',
        key: 'time',
        render: item => (
          <span className={`${styles.timer}`}>{time.formatDate(item.createdAt, 'YYYY-MM-DD HH:mm')}</span>
        ),
      },
    ];
    return columns;
  };

  // 获取冻结金额列
  getFrozenColumns = () => {
    const columns = [
      {
        title: 'ID',
        key: 'ID',
        render: item => <span className={styles.normalText}>{item.id || '暂无内容'}</span>,
      },
      {
        title: '记录描述',
        key: 'type',
        render: item => <span className={styles.normalText}>{item.changeDesc || '暂无内容'}</span>,
      },
      {
        title: '冻结金额',
        key: 'amount',
        render: item => <span className={`${styles.frozenAmount}`}>{item.amount || 0.0}</span>,
      },
      {
        title: '时间',
        key: 'time',
        render: item => (
          <span className={`${styles.timer}`}>{time.formatDate(item.createdAt, 'YYYY-MM-DD HH:mm')}</span>
        ),
      },
    ];
    return columns;
  };

  // 获取提现金额列
  getWithdrawalColumns = () => {
    const columns = [
      {
        title: '交易号',
        key: 'type',
        render: item => <span className={styles.normalText}>{item.tradeNo || '暂无内容'}</span>,
      },
      {
        title: '提现状态',
        style: {
          width: '15%'
        },
        key: 'status',
        render: item => <span className={
          classNames(styles.normalText,{
            [styles.wait]: Number(item.cashStatus) === 1,
            [styles.remitedFailed]: Number(item.cashStatus) === 3 || Number(item.cashStatus) === 6,
            [styles.pass]: Number(item.cashStatus) === 4,
            [styles.remited]: Number(item.cashStatus) === 5
          })
        }>{STATUS_MAP[item.cashStatus] || '暂无内容'}</span>,
      },
      {
        title: '提现金额',
        style: {
          width: '15%'
        },
        key: 'cashApplyAmount',
        render: item => <span className={`${styles.frozenAmount}`}>-{item.cashApplyAmount}</span>,
      },
      {
        title: '提现时间',
        key: 'time',
        render: item => (
          <span className={`${styles.timer}`}>{item.tradeTime ? time.formatDate(item.tradeTime, 'YYYY-MM-DD HH:mm') : '暂无'}</span>
        ),
      },
      {
        title: '提现账号',
        key: 'receiveAccount',
        style: {
          width: '30%',
        },
        render: item => (
          <span className={`${styles.receiveAccount}`}>{ item?.receiveAccount || '银行卡：中国银行，仇凯；\n 银行卡号：420989832813123'}</span>
        ),
      },
    ];
    return columns;
  };

  renderColumns = () => {
    const { activeType } = this.props;
    let columns = [];
    switch (activeType) {
      case 'income':
        columns = this.getIncomeColumns();
        break;
      case 'pay':
        columns = this.getPayColumns();
        break;
      case 'withdrawal':
        columns = this.getWithdrawalColumns();
        break;
      case 'frozen':
        columns = this.getFrozenColumns();
        break;
      default:
        break;
    }
    return columns;
  };

  render() {
    const { data = [] } = this.props;
    return (
      <div className={styles.container}>
        <RenderList columns={this.renderColumns()} data={data} className={styles.tabelList} />
      </div>
    );
  }
}

export default withRouter(WalletInfo);
