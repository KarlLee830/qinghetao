import React, { Component } from 'react';
import styles from './index.module.scss';
import { Dialog, Button, Checkbox, Icon, Input, Toast, Radio, Divider, Spin } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import { PAYWAY_MAP, STEP_MAP, PAY_MENT_MAP } from '../../../../../common/constants/payBoxStoreConstants';
import throttle from '@common/utils/thottle.js';
import Router from '@discuzqsdk/sdk/dist/router';

@inject('site')
@inject('user')
@inject('payBox')
@observer
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      paymentType: 'wallet',
      imageShow: false,
    };
  }

  onClose = () => {
    this.props.payBox.visible = false;
    // FIXME: 延时回调的修复
    setTimeout(() => {
      this.props.payBox.clear();
    }, 500);
  };

  async componentDidMount() {
    try {
      // this.changePayment();
      this.initState();
      document.addEventListener('keydown', this.handleKeyDown);
      // 获取钱包用户信息
      const { id } = this.props?.user;
      if (!id) return;
      await this.props.payBox.getWalletInfo(id);
    } catch (error) {
      console.log(error);
      Toast.error({
        content: '获取用户钱包信息失败',
        duration: 1000,
      });
    }
    this.isRecharge();
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  // 判断是否是充值
  isRecharge = () => {
    const { isWechatPayOpen, webConfig } = this.props.site || {};
    const { siteCharge } = webConfig.setSite || {};
    const isShowRecharge = isWechatPayOpen && siteCharge === 1;
    if (!isShowRecharge) return;
    const { options = {} } = this.props.payBox;
    const { type } = options;
    // 隐藏钱包支付，保留微信支付
    if (type === 30) {
      this.props.payBox.payWay = PAYWAY_MAP.WX;
      this.handleChangePaymentType(PAYWAY_MAP.WX);
      return;
    }
  }

  // 匹配输入的数字
  toMarryNumber = (num) => {
    let value;
    switch (num) {
      case 48:
      case 96:
        value = '0';
        break;
      case 49:
      case 97:
        value = '1';
        break;
      case 50:
      case 98:
        value = '2';
        break;
      case 51:
      case 99:
        value = '3';
        break;
      case 52:
      case 100:
        value = '4';
        break;
      case 53:
      case 101:
        value = '5';
        break;
      case 54:
      case 102:
        value = '6';
        break;
      case 55:
      case 103:
        value = '7';
        break;
      case 56:
      case 104:
        value = '8';
        break;
      case 57:
      case 105:
        value = '9';
        break;
      default:
        break;
    }
    return value;
  };

  // 监听键盘事件
  handleKeyDown = (e) => {
    if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 96 && e.keyCode <= 105)) {
      // 表示输入数字
      let set_num = this.toMarryNumber(e.keyCode);
      this.updatePwd(set_num, 'add');
    } else if (e.keyCode == 13) {
      // 表示输入回车
    } else if (e.keyCode == 8) {
      // 表示回退事件
      this.updatePwd('', 'delete');

      if (e.returnValue) {
        e.returnValue = false;
      }

      if (e.preventDefault) {
        e.preventDefault();
      }
      
      return false;
    } else {
      // 其他非数字情况
    }
  };

  updatePwd = (set_num, type) => {
    const { list = [] } = this.state;
    if (type == 'add') {
      let list_ = [...list];
      if (list.length >= 6) {
        return;
      }
      this.setState(
        {
          list: [].concat(list_, [set_num]),
        },
        () => {
          if (this.state.list.length === 6) {
            // this.submitPwa();
          }
        },
      );
    } else if (type == 'delete') {
      this.setState({
        list: list.slice(0, list.length - 1),
      });
    }
  };

  initState = () => {
    this.setState({
      paymentType: 'wallet',
      list: [],
      imageShow: false,
      isSubmit: false,
    });
    this.props.payBox.payWay = PAYWAY_MAP.WALLET;
    this.props.payBox.password = null;
  };

  goSetPayPwa = () => {
    this.props.payBox.step = STEP_MAP.SET_PASSWORD;
  };

  /**
   * 选择支付方式
   */
  handleChangePaymentType = (value) => {
    this.props.payBox.payWay = value;
    if (this.props.payBox.payWay === PAYWAY_MAP.WX) {
      this.props.payBox.wechatPayOrderQRCode();
    } else {
      this.props.payBox.clearOrderStatusTimer();
    }
  };

  // 去充值
  toRechargePop = () => {
    Router.push({ url: `/wallet` });
    this.onClose();
    return;
  }

  // 点击确认支付
  handlePayConfirmed = throttle(async () => {
    if (this.isToRecharge()) {
      this.toRechargePop();
      return;
    }
    if (this.state.isSubmit) return;
    this.setState({
      isSubmit: true,
    });
    if (this.props.payBox.payWay === PAYWAY_MAP.WALLET) {
      // 表示钱包支付
      // await this.props.payBox.walletPayEnsure();
      if (this.state.list.length !== 6) {
        Toast.error({
          content: '请输入支付密码',
          hasMask: false,
          duration: 1000,
        });
        this.setState({
          isSubmit: false,
        });
        return;
      }
      const { list = [] } = this.state;
      this.props.payBox.password = list.join('');
      try {
        await this.props.payBox.walletPayOrder();
        Toast.success({
          content: '支付成功',
          hasMask: false,
          duration: 1000,
        });
        this.onClose();
        this.setState({
          isSubmit: false,
        });
      } catch (error) {
        Toast.error({
          content: error.Message || '支付失败，请重新输入',
          hasMask: false,
          duration: 1000,
        });
        this.initState();
      }
    }
  }, 500);

  // 转换金额小数
  transMoneyToFixed = (num) => {
    return Number(num).toFixed(2);
  };

  renderDiffPaymementContent = () => {
    if (this.props.payBox.payWay === PAYWAY_MAP.WX) {
      return this.renderWechatCodePaymementContent();
    }
    if (this.props.payBox.payWay === PAYWAY_MAP.WALLET) {
      return this.renderWalletPaymementContent();
    }
  };

  // 处理图片加载错误
  handleImgFetchingError = () => {
    this.setState({
      imageShow: false,
    });
  };

  // 处理图片加载中
  handleImgFetching = () => {
    this.setState({
      imageShow: true,
    });
  };

  handleTimeoutRefresh = async () => {
    await this.props.payBox.wechatPayOrderQRCode();
  };

  // 渲染微信支付内容
  renderWechatCodePaymementContent = () => (
    <div className={styles.wechatPayment}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* 二维码 */}
        <div className={styles.wPaymentCode}>
          {this.props.payBox.qrCodeTimeout && (
            <div className={styles.timeout} onClick={this.handleTimeoutRefresh}>
              已超时，点击刷新
            </div>
          )}
          {!this.state.imageShow && (
            <Spin type="spinner" size={14}>
              加载中
            </Spin>
          )}
          <img
            style={{
              display: this.state.imageShow ? 'block' : 'none',
            }}
            onLoad={this.handleImgFetching}
            onError={this.handleImgFetchingError}
            src={this.props.payBox.wechatQRCode}
            alt="二维码"
          />
        </div>
        {/* 微信支付内容 */}
        <div className={styles.wPaymentDec}>
          <div className={styles.wPayment_01}>
            <Icon className={styles.icon} name={'WechatPaymentOutlined'} color={'#09bb07'} size={16} />
            微信支付
          </div>
          <div className={styles.wPayment_02}>
            <Icon className={styles.icon} name={'ScanOutlined'} color={'#09bb07'} size={20} />
            <div>
              <p>打开手机微信扫一扫</p>
              <p>扫描二维码完成支付</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.wPayment_03}>
        <p>二维码有效时长为5分钟，请尽快支付</p>
      </div>
    </div>
  );

  renderPwdItem() {
    const { list = [] } = this.state;
    const nodeList = list.map((item, key) => (
      <div className={`${styles.payListItem}`} key={key}>
        {'●'}
      </div>
    ));
    if (nodeList.length < 6) {
      let curr = false;
      for (let i = nodeList.length; i < 6; i++) {
        if (!curr) {
          curr = true;
          nodeList.push(<div className={`${styles.payListItem}`} key={i}></div>);
        } else {
          nodeList.push(<div className={`${styles.payListItem}`} key={i}></div>);
        }
      }
    }
    return nodeList;
  }

  // 支付按钮文本显示
  getPayText = () => {
    if (this.isToRecharge()) {
      return '去充值';
    }
    return '确定支付';
  }

  isToRecharge = () => {
    const { options = {} } = this.props.payBox;
    const { amount = 0 } = options;
    const { isWechatPayOpen, webConfig } = this.props.site || {};
    const { siteCharge } = webConfig.setSite || {};
    const isSiteChargeOpen = siteCharge === 1;
    // 去充值，需要开启微信支付 && 开启充值功能 && 支付方式为钱包支付 && 钱包余额不足
    if (isWechatPayOpen && isSiteChargeOpen && this.props.payBox.payWay === PAYWAY_MAP.WALLET && Number(this.props.payBox?.walletAvaAmount) < Number(amount)) return true;
    return false;
  }

  // 渲染钱包支付内容
  renderWalletPaymementContent = () => {
    const { user } = this.props;
    const { userInfo = {} } = user;
    const { canWalletPay } = userInfo || {};
    const { options = {} } = this.props.payBox;
    const { amount = 0 } = options;
    const { list = [], isSubmit } = this.state;
    const newPassWord = list.join('');
    let disabled = (!newPassWord || newPassWord.length !== 6 || isSubmit) && !this.isToRecharge();
    return (
      <div className={`${styles.walletPayment}`}>
        <div className={styles.walletTitle}>
          <Icon className={styles.icon} name="PurseOutlined" size="20" color={'#1878f3'} />
          <span className={styles.text}>钱包支付</span>
        </div>
        {!canWalletPay ? (
          <>
            <div className={`${styles.walletDec} ${styles.walletPay}`}>
              <span>钱包余额</span>
              {this.props.payBox?.walletAvaAmount ? (
                <span className={styles.walletBalance}>￥{this.props.payBox?.walletAvaAmount}</span>
              ) : (
                <Spin type="spinner" size={14}></Spin>
              )}
            </div>
            <div className={styles.walletDec}>
              <span>支付密码</span>
              <span>
                <span className={styles.walletText}>钱包支付，需 </span>
                <span onClick={this.goSetPayPwa} className={styles.walletSettingPwd}>
                  设置支付密码
                </span>
              </span>
            </div>
          </>
        ) : (
          <>
            {Number(this.props.payBox?.walletAvaAmount) < Number(amount) ? (
              <div className={styles.walletDec}>
                <span>钱包余额</span>
                {this.props.payBox?.walletAvaAmount ? (
                  <span className={styles.walletBalance}>￥{this.props.payBox?.walletAvaAmount}</span>
                ) : (
                  <Spin type="spinner" size={14}></Spin>
                )}
                <span className={styles.walletWarn}>余额不足</span>
              </div>
            ) : (
              <>
                <div className={`${styles.walletDec} ${styles.walletPay}`}>
                  <span>钱包余额</span>
                  {this.props.payBox?.walletAvaAmount ? (
                    <span className={styles.walletBalance}>￥{this.props.payBox?.walletAvaAmount}</span>
                  ) : (
                    <Spin type="spinner" size={14}></Spin>
                  )}
                </div>
                <div className={`${styles.walletDec} ${styles.walletPayPwd}`}>
                  <span>支付密码</span>
                  <div className={styles.payList}>{this.renderPwdItem()}</div>
                </div>
              </>
            )}
            <div className={styles.walletConfirmBc}>
              <Button
                onClick={this.handlePayConfirmed}
                size="large"
                className={styles.walletConfirmBtn}
                type="primary"
                disabled={disabled}
                full
              >
                {isSubmit ? <Spin type="spinner">支付中...</Spin> : this.getPayText()}
              </Button>
            </div>
          </>
        )}
      </div>
    );
  };

  render() {
    const { options = {}, qrCodeTimeout } = this.props?.payBox;
    const { amount = 0, type } = options;
    const isRecharge = type === 30;
    return (
      <div>
        <div className={styles.payconfirmWrapper}>
          {/* 头部 */}
          <div className={styles.payTitle}>支付</div>
          {/* 支付金额显示 */}

          <div className={styles.payMoney}>
            支付金额： <span className={styles.payM}>￥{this.transMoneyToFixed(amount)}</span>
          </div>
          {/* tab切换支付方式 */}
          <div>
            <div className={styles.payTab_top}>
              <Radio.Group value={this.props.payBox.payWay} onChange={this.handleChangePaymentType}>
                {this.props.site.isWechatPayOpen && this.props.site.wechatEnv !== 'none' && (
                  <Radio name={'weixin'} className={`${styles.payTab} `}>
                    微信支付
                  </Radio>
                )}
                {!isRecharge && (
                  <Radio name={'wallet'} className={`${styles.payTab}`}>
                    钱包支付
                  </Radio>
                )}
              </Radio.Group>
            </div>
            <Divider className={styles.payLine} />
            {/* 渲染不同方式的支付内容 */}
            <div className={styles.payTab_bottom}>{this.renderDiffPaymementContent()}</div>
          </div>
          {/* 关闭按钮 */}
          <div onClick={this.onClose} className={styles.paymentCloseBtn}>
            <Icon name="CloseOutlined" size={12} />
          </div>
        </div>
      </div>
    );
  }
}
