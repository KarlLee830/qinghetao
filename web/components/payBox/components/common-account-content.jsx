import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import { Checkbox, Divider } from '@discuzqsdk/design';
import { ORDER_TRADE_TYPE } from '../../../../common/constants/payBoxStoreConstants';

@inject('site')
@inject('payBox')
@observer
export default class CommonAccountContent extends Component {

  constructor(props) {
    super(props)
    this.state = {
      tradeContent: [
        {
          type: ORDER_TRADE_TYPE.ORDER_TYPE_REDPACKET,
          name: '红包'
        },
        {
          type: ORDER_TRADE_TYPE.ORDER_TYPE_QUESTION_REWARD,
          name: '悬赏'
        }
      ]
    }
  }

  /**
   * 渲染不同交易类型
   * @param {String} type
   * @returns 返回对应交易类型名称
   */
   renderDiffTradeType = (type) => {
    let value = '';
    switch (type) {
      case ORDER_TRADE_TYPE.ORDER_TYPE_REGISTER: // 表示注册(站点付费加入) 1
        value = '付费加入';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_REWARD: // 表示打赏 2
        value = '打赏';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_THREAD: // 付费主题 3
        value = '付费帖';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_GROUP: // 付费用户组 4
        value = '购买权限组';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_QUESTION: // 问答提问支付 5
        value = '付费提问';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_ONLOOKER: // 问答围观 6
        value = '问答围观';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_ATTACHMENT: // 附件 7
        value = '帖子内容';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_RENEW: // 站点付费 8
        value = '站点付费';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_REDPACKET: // 红包 9
        value = '红包';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_QUESTION_REWARD: // 悬赏 10
        value = '悬赏';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_MERGE: // 合并支付（红包+悬赏）11
        value = '红包+悬赏';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_TEXT: // 文字帖红包 20
        value = '文字帖红包';
        break;
      case ORDER_TRADE_TYPE.ORDER_TYPE_RECHARGE: // 充值 30
        value = '充值';
        break;
      default:
        break;
    }
    return value;
  };

  // 转换金额小数
  transMoneyToFixed = (num) => {
    return Number(num).toFixed(2);
  };

  handleChangeIsAnonymous = (checked) => {
    this.props.payBox.isAnonymous = checked
  }

  render() {
    const { currentPaymentData = {} } = this.props;
    const { type, amount, isAnonymous, title, redAmount, rewardAmount } = currentPaymentData;
    const { platform } = this.props?.site;
    const { tradeContent = [] } = this.state
    return (
      <>
        {/* 标题 */}
        <div className={styles.amountTitle} style={{ textAlign: platform === 'pc' ? 'center' : 'left' }}>确认金额</div>
        {/* 主要内容区域 */}
        <div className={`${styles.amountContent} ${platform === 'pc' && styles.amountContentPC}`}>
          {
            type === ORDER_TRADE_TYPE.ORDER_TYPE_MERGE ? (
              <>
                {
                  tradeContent.map((item, index) => {
                    const amount_ = item.type === ORDER_TRADE_TYPE.ORDER_TYPE_REDPACKET ? redAmount : rewardAmount
                    return <>
                      <div className={styles.acExplain}>
                        <span className={styles.acExplainLabel}>交易类型</span>{' '}
                        <span className={styles.acExplainValue}>{this.renderDiffTradeType(item.type)}</span>
                      </div>
                      <Divider className={styles.acExplainDivider} />
                      <div className={styles.acExplain}>
                        <span className={styles.acExplainLabel}>商品名称</span>{' '}
                        <span className={styles.acExplainValue}>{title}</span>
                      </div>
                      <Divider className={styles.acExplainDivider} />
                      <div className={styles.acExplain}>
                        <span className={styles.acExplainLabel}>支付金额</span>
                        <span className={styles.acExplainNum}>￥{this.transMoneyToFixed(amount_)}</span>
                      </div>
                      {index === 0 && <div className={styles.ampuntLineWrap}><div className={styles.ampuntLine}></div></div>}
                      {/* {index === 1 && <Divider className={styles.acExplainDivider} />} */}
                    </>
                  })
                }
              </>
            ) : (
              <>
                <div className={styles.acExplain}>
                  <span className={styles.acExplainLabel}>交易类型</span>{' '}
                  <span className={styles.acExplainValue}>{this.renderDiffTradeType(type)}</span>
                </div>
                <Divider className={styles.acExplainDivider} />
                <div className={styles.acExplain}>
                  <span className={styles.acExplainLabel}>商品名称</span>{' '}
                  <span className={styles.acExplainValue}>{title}</span>
                </div>
                <Divider className={styles.acExplainDivider} />
                <div className={styles.acExplain}>
                  <span className={styles.acExplainLabel}>支付金额</span>
                  <span className={styles.acExplainNum}>￥{this.transMoneyToFixed(amount)}</span>
                </div>
                {
                  type === ORDER_TRADE_TYPE.REGEISTER_SITE &&
                  (
                    <div className={`${styles.acExplain} ${platform === 'h5' && styles.acExplainH5}`}>
                      <Checkbox checked={this.props.payBox.isAnonymous} onChange={this.handleChangeIsAnonymous} /> 隐藏我的付费信息
                    </div>
                  )}
                {/* {
                  platform === 'h5' && (
                    <Divider className={styles.acExplainDivider} />
                  )
                } */}
              </>
            )
          }
        </div>
      </>
    );
  }
}

CommonAccountContent.defaultProps = {
  currentPaymentData: {}, // 当前支付对象
  isNotShowTitle: false, // 是否不显示title标题
};
