import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Divider from '@discuzqsdk/design/dist/components/divider/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import Checkbox from '@discuzqsdk/design/dist/components/checkbox/index';
import styles from './index.module.scss';
import { View, Text } from '@tarojs/components';
import { ORDER_TRADE_TYPE } from '../../../../../common/constants/payBoxStoreConstants';
import throttle from '@common/utils/thottle.js';

@inject('payBox')
@observer
export default class AmountRecognized extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tradeContent: [
        {
          type: ORDER_TRADE_TYPE.ORDER_TYPE_REDPACKET,
          name: '红包',
        },
        {
          type: ORDER_TRADE_TYPE.ORDER_TYPE_QUESTION_REWARD,
          name: '悬赏',
        },
      ],
      isLoading: false,
    };
  }

  onClose = () => {
    // FIXME: 延时回调的修复
    this.props.payBox.visible = false;

    setTimeout(() => {
      this.props.payBox.clear();
    }, 300);
  };

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

  // 点击支付去到 选择支付方式页面
  goToThePayConfirmPage = throttle(async () => {
    if (this.state.isLoading) return;
    try {
      this.setState({
        isLoading: true,
      });
      await this.props.payBox.createOrder();
      this.setState({
        isLoading: false,
      });
    } catch (error) {
      Toast.error({
        content: error.Message,
        hasMask: false,
        duration: 1000,
      });
      this.onClose();
      this.setState({
        isLoading: false,
      });
    }
  }, 300);

  handleChangeIsAnonymous = (checked) => {
    this.props.payBox.isAnonymous = checked;
  };

  renderContent = () => {
    const { options = {} } = this.props?.payBox;
    const { type, amount, isAnonymous, title, redAmount, rewardAmount } = options;
    return (
      <View className={styles.giftInfo}>
        {/* 标题 */}
        <View className={styles.amountTitle}>确认金额</View>
        {/* 主要内容区域 */}
        <View className={styles.amountContent}>
          <>
            {type === ORDER_TRADE_TYPE.ORDER_TYPE_MERGE ? (
              <>
                {this.state.tradeContent.map((item, index) => {
                  const amount_ = item.type === ORDER_TRADE_TYPE.ORDER_TYPE_REDPACKET ? redAmount : rewardAmount;
                  return (
                    <>
                      <View className={styles.acExplain}>
                        <Text className={styles.acExplainLabel}>交易类型</Text>{' '}
                        <Text className={styles.acExplainValue}>{this.renderDiffTradeType(item.type)}</Text>
                      </View>
                      <Divider className={styles.acExplainDivider} />
                      <View className={styles.acExplain} style={{ display: 'flex' }}>
                        <Text className={styles.acExplainLabel}>商品名称</Text>{' '}
                        <Text style={{ display: 'block' }} className={styles.acExplainValue}>
                          {title}
                        </Text>
                      </View>
                      <Divider className={styles.acExplainDivider} />
                      <View className={styles.acExplain}>
                        <Text className={styles.acExplainLabel}>支付金额</Text>
                        <Text className={styles.acExplainNum}>￥{this.transMoneyToFixed(amount_)}</Text>
                      </View>
                      {index === 0 && (
                        <View className={styles.ampuntLineWrap}>
                          <View className={styles.ampuntLine}></View>
                        </View>
                      )}
                    </>
                  );
                })}
              </>
            ) : (
              <>
                <View className={styles.acExplain}>
                  <Text className={styles.acExplainLabel}>交易类型</Text>{' '}
                  <Text className={styles.acExplainValue}>{this.renderDiffTradeType(type)}</Text>
                </View>
                <Divider className={styles.acExplainDivider} />
                <View className={styles.acExplain}>
                  <Text className={styles.acExplainLabel}>商品名称</Text>{' '}
                  <Text className={styles.acExplainValue}>{title}</Text>
                </View>
                <Divider className={styles.acExplainDivider} />
                <View className={styles.acExplain}>
                  <Text className={styles.acExplainLabel}>支付金额</Text>
                  <Text className={styles.acExplainNum}>￥{this.transMoneyToFixed(amount)}</Text>
                </View>
                {type === ORDER_TRADE_TYPE.REGEISTER_SITE && (
                  <View className={`${styles.acExplain} ${styles.acExplainH5}`}>
                    <Checkbox checked={this.props.payBox.isAnonymous} onChange={this.handleChangeIsAnonymous} />{' '}
                    隐藏我的付费信息
                  </View>
                )}
              </>
            )}
          </>
        </View>
      </View>
    );
  };

  // 转换金额小数
  transMoneyToFixed = (num) => {
    return Number(num).toFixed(2);
  };

  render() {
    const { options = {} } = this.props.payBox;
    const { amount = 0 } = options;
    const { isLoading } = this.state;
    return (
      <View className={styles.amountWrapper}>
        {this.renderContent()}
        {/* 按钮区域-提交内容 */}
        <View className={styles.btnBox}>
          <Button
            type="primary"
            onClick={this.goToThePayConfirmPage}
            size="large"
            className={styles.btn}
            full
            disabled={isLoading}
          >
            {isLoading ? <Spin type="spinner">生成订单中...</Spin> : `支付 ￥${this.transMoneyToFixed(amount)}`}
          </Button>
        </View>
        {/* 关闭按钮 */}
        <View onClick={this.onClose} className={styles.payBoxCloseIcon}>
          <Icon name="CloseOutlined" size={12} />
        </View>
      </View>
    );
  }
}
