import { observable, computed, action } from 'mobx';
import { get } from '../../utils/get';
import isWeixin from '../../utils/is-weixin';
import {
  createOrders,
  createPayOrder,
  readOrderDetail,
  readWalletUser,
  updateUsersUpdate,
  readResetPayPwdToken,
  updatePayPwd,
  smsSend,
} from '@server';
import { STEP_MAP, PAY_MENT_MAP, ORDER_STATUS_MAP, PAY_BOX_ERROR_CODE_MAP } from '../../constants/payBoxStoreConstants';
import locals from '@common/utils/local-bridge';

const noop = () => { };

class PayBoxStore {
  // 成功回调
  onSuccess = noop;
  successCallback = () => {
    this.onSuccess(this.orderInfo);
  };

  // 失败回调
  onFailed = noop;
  failedCallback = () => {
    this.onFailed(this.orderInfo);
  };

  // 结束回调
  onCompleted = noop;
  completedCallback = () => {
    this.onCompleted(this.orderInfo);
  };

  // 创建定点回调
  onOrderCreated = noop;

  qrCodeCheckTimer = null;

  // 订单 options
  @observable options = {};

  // 窗口是否可见
  @observable visible = false;

  // 订单信息
  @observable orderInfo = null;

  // 是否匿名
  @observable isAnonymous = false;

  // 轮询 timer
  @observable timer = null;

  // 当前所属的阶段
  @observable step = STEP_MAP.SURE;

  // 如果为 null，则代表没有选择支付方式
  @observable payWay = null;

  // 如果为 null，则代表支付还没完成
  @observable payResult = null;

  // 如果钱包支付，钱包的密码存储在这里
  @observable password = null;

  // h5 微信支付回调链接
  @observable h5RedirectLink = null;

  // 确认支付成功弹窗是否可见
  @observable h5SureDialogVisible = false;

  // ios h5外微信支付的 flag
  @observable h5IOSPaidFlag = false;

  // 用户钱包信息
  @observable walletInfo = null;

  // PC下使用的付费二维码
  @observable wechatQRCode = null;

  // pc使用的付费二维码是否过期
  @observable qrCodeTimeout = false;

  // 重设支付密码原支付密码
  @observable oldPayPwd = '';

  // 重设支付密码所需要的 token
  @observable payPwdResetToken = '';

  @observable newPayPwd = '';

  @observable newPayPwdRepeat = '';

  // 用户钱包状态
  @computed get walletStatus() {
    return null;
  }

  // 用户钱包可用余额
  @computed get walletAvaAmount() {
    return get(this.walletInfo, 'availableAmount');
  }

  // 订单编号信息
  @computed get orderSn() {
    return get(this.orderInfo, 'orderSn');
  }

  resErrorFactory = (res, handlers = {}) => {
    const resCode = get(res, 'code');
    if (handlers[resCode]) {
      handlers(res);
    }
    if (resCode !== 0) {
      throw {
        Code: res.code,
        Message: res.msg,
      };
    }
  }

  errorHandler = async (error) => {
    console.log(error);
    if (error.Code) {
      throw {
        Code: error.Code,
        Message: error.Message,
      };
    }
    throw {
      ...PAY_BOX_ERROR_CODE_MAP.NETWORK_ERROR,
      error,
    };
  }

  /**
   * 二维码过期检查
   */
  @action
  checkQrCodeTimeout = () => {
    clearTimeout(this.qrCodeCheckTimer);
    this.qrCodeCheckTimer = setTimeout(() => {
      clearTimeout(this.timer);
      this.qrCodeTimeout = true;
      // 超时时间
    }, 1000 * 5 * 60);
  }

  /**
   * 创建订单
   */
  @action
  createOrder = async () => {
    try {
      this.h5IOSPaidFlag = false;
      locals.set('H5_IOS_PAID_FLAG', 'false');
      const data = {
        ...this.options,
        isAnonymous: this.isAnonymous,
      };
      const createRes = await createOrders({
        data,
      });
      if (get(createRes, 'code') === 0) {
        this.orderInfo = get(createRes, 'data', {});
        locals.set('PAY_ORDER_INFO', JSON.stringify(this.orderInfo));
        locals.set('PAY_ORDER_OPTIONS', JSON.stringify(this.options));
        if (this.onOrderCreated) {
          this.onOrderCreated(this.orderInfo);
        }
        setTimeout(()=>{
          this.step = STEP_MAP.PAYWAY;
        },200)
        return createRes;
      }
      this.resErrorFactory(createRes);
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        ...PAY_BOX_ERROR_CODE_MAP.NETWORK_ERROR,
        error,
      };
    }
  };

  /**
   * 获取用户钱包信息
   */
  @action
  getWalletInfo = async (uid) => {
    try {
      const getWalletRes = await readWalletUser({
        params: { uid },
      });

      if (get(getWalletRes, 'code') === 0) {
        this.walletInfo = get(getWalletRes, 'data', {});
        return getWalletRes;
      }

      this.resErrorFactory(getWalletRes);
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        ...PAY_BOX_ERROR_CODE_MAP.NETWORK_ERROR,
        error,
      };
    }
  }

  /**
   * 进入钱包输入密码环节
   */
  @action
  walletPayEnsure = () => {
    this.step = STEP_MAP.WALLET_PASSWORD;
  }

  /**
   * 钱包支付订单
   */
  @action
  walletPayOrder = async () => {
    try {
      const payRes = await createPayOrder({
        data: {
          orderSn: this.orderSn,
          paymentType: PAY_MENT_MAP.WALLET,
          payPassword: this.password,
        },
      });

      this.resErrorFactory(payRes);

      // 支付成功
      if (get(payRes, 'data.walletPayResult.result') === 'success') {
        this.successCallback();
        this.completedCallback();
        return payRes;
      }
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        ...PAY_BOX_ERROR_CODE_MAP.NETWORK_ERROR,
        error,
      };
    }
  };

  /**
   * 微信支付订单
   * 后端实现分别位于 h5-backend 和 miniprogram-backend
   */
  @action
  wechatPayOrder = async ({
    listenWXJsBridgeAndExecCallback,
    onBridgeReady,
    wxValidator = noop,
    mode,
  }) => {
    try {
      wxValidator();
      const payRes = await createPayOrder({
        data: {
          orderSn: this.orderSn,
          paymentType: mode,
        },
      });

      this.resErrorFactory(payRes);

      if (payRes.code === 0) {
        // 清空之前的定时器
        clearInterval(this.timer);

        if (mode === PAY_MENT_MAP.WX_H5) {
          listenWXJsBridgeAndExecCallback(() => {
            this.h5RedirectLink = get(payRes, 'data.wechatPayResult.wechatH5Link');
            onBridgeReady(get(payRes, 'data.wechatPayResult.wechatH5Link'));
          });
          return;
        }
        listenWXJsBridgeAndExecCallback(() => {
          onBridgeReady(get(payRes, 'data.wechatPayResult.wechatJs'));
          this.timer = setInterval(() => {
            this.getOrderDetail();
          }, 3000);
        });
      }
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        ...PAY_BOX_ERROR_CODE_MAP.NETWORK_ERROR,
        error,
      };
    }
  };

  /**
   * 微信支付订单
   */
  @action
  wechatPayOrderQRCode = async () => {
    try {
      const payRes = await createPayOrder({
        data: {
          orderSn: this.orderSn,
          paymentType: PAY_MENT_MAP.WX_QRCODE,
        },
      });

      this.resErrorFactory(payRes);

      this.wechatQRCode = get(payRes, 'data.wechatPayResult.wechatQrcode');

      // 每次进来清空上次的 timer
      this.qrCodeTimeout = false;

      // 清空之前的定时器
      clearInterval(this.timer);

      // 二维码有过期时间
      this.checkQrCodeTimeout();

      this.timer = setInterval(async () => {
        await this.getOrderDetail();
      }, 3000);
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        ...PAY_BOX_ERROR_CODE_MAP.NETWORK_ERROR,
        error,
      };
    }
  };

  /**
   * 清空订单状态轮询定时器
   */
  @action
  clearOrderStatusTimer = () => {
    clearInterval(this.timer);
    clearInterval(this.qrCodeCheckTimer);
  }

  /**
   * 获取订单详情
   */
  @action
  getOrderDetail = async () => {
    try {
      const orderInfoRes = await readOrderDetail({
        params: {
          orderSn: this.orderSn,
        },
      });

      // if request failed
      this.resErrorFactory(orderInfoRes);

      const orderStatus = get(orderInfoRes, 'data.status');

      if (orderStatus === ORDER_STATUS_MAP.PENDING_PAY) {
        return;
      }

      clearInterval(this.timer);
      this.timer = null;

      if (orderStatus === ORDER_STATUS_MAP.PAID) {
        clearTimeout(this.qrCodeCheckTimer);
        this.qrCodeTimeout = true;
        // success
        this.successCallback();
        this.completedCallback();
        // FIXME: 暂时使用延时 clear
        setTimeout(() => {
          this.clear();
        }, 300);
      }

      if (orderStatus === ORDER_STATUS_MAP.OUT_DATE_PAY) {
        clearTimeout(this.qrCodeCheckTimer);
        this.qrCodeTimeout = true;
        // outdate
        this.failedCallback();
        this.completedCallback();
        // FIXME: 暂时使用延时 clear
        setTimeout(() => {
          this.clear();
        }, 300);
      }

      if (orderStatus === ORDER_STATUS_MAP.FAIL_PAY) {
        clearTimeout(this.qrCodeCheckTimer);
        this.qrCodeTimeout = true;
        // paid failed
        this.failedCallback();
        this.completedCallback();
        // FIXME: 暂时使用延时 clear
        setTimeout(() => {
          this.clear();
        }, 300);
      }
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        ...PAY_BOX_ERROR_CODE_MAP.NETWORK_ERROR,
        error,
      };
    }
  }

  /**
   * 设置支付密码
   */
  @action
  setPayPassword = async () => {
    try {
      const setPayPwdRes = await updateUsersUpdate({
        data: {
          payPassword: this.password,
          payPasswordConfirmation: this.password,
        },
      });

      this.resErrorFactory(setPayPwdRes);
    } catch (error) {
      console.log(error);
      if (error.Code) {
        throw error;
      }
      throw {
        ...PAY_BOX_ERROR_CODE_MAP.NETWORK_ERROR,
        error,
      };
    }
  }

  /**
   * 获取重设支付密码 token
   */
  @action
  getPayPwdResetToken = async () => {
    if (!this.oldPayPwd) {
      // error
      return;
    }
    const getTokenRes = await readResetPayPwdToken({
      data: {
        payPassword: this.oldPayPwd,
      },
    });
    if (getTokenRes.code === 0) {
      this.payPwdResetToken = get(getTokenRes, 'data.sessionId');

      return this.payPwdResetToken;
    }
    throw {
      Code: getTokenRes.code,
      Msg: getTokenRes.msg,
    };
  }


  /**
   * 利用原密码重设支付密码
   */
  @action
  resetPayPwd = async () => {
    const resetPayPwdRes = await updateUsersUpdate({
      data: {
        payPassword: this.newPayPwd,
        payPasswordConfirmation: this.newPayPwdRepeat,
        payPasswordToken: this.payPwdResetToken,
      },
    });
    if (resetPayPwdRes.code === 0) {
      return resetPayPwdRes.data;
    }

    throw {
      Code: resetPayPwdRes.code,
      Msg: resetPayPwdRes.msg,
    };
  }

  /**
   * 重设支付密码 手机号验证
   * @param {*} param0
   * @returns
   */
  @action
  async sendSmsVerifyCode({
    mobile,
    captchaTicket,
    captchaRandStr,
  }) {
    const smsResp = await smsSend({

      data: {
        mobile,
        type: 'reset_pay_pwd',
        captchaTicket,
        captchaRandStr,
      },
    });
    if (smsResp.code === 0) {
      // 可以利用 interval 获取过期时间
      return smsResp.data;
    }

    throw {
      Code: smsResp.code,
      Message: smsResp.msg,
    };
  }

  /**
   * 忘记支付密码，利用手机号进行支付密码的重置
   */
  @action
  forgetPayPwd = async ({
    mobile,
    code,
    payPassword,
    payPasswordConfirmation,
  }) => {
    const forgetPayPwdRes = await updatePayPwd({
      data: {
        mobile,
        code,
        payPassword,
        payPasswordConfirmation,
      },
    });

    if (forgetPayPwdRes.code === 0) {
      return forgetPayPwdRes.data;
    }

    throw {
      Code: forgetPayPwdRes.code,
      Msg: forgetPayPwdRes.msg,
    };
  }

  /**
   * 展示支付框
   */
  @action
  show = () => {
    this.visible = true;
  }

  /**
   * 隐藏支付框
   */
  @action
  hide = () => {
    this.visible = false;
  }

  /**
   * 清空支付密码对应函数
   */
  @action
  clearPayPassword = () => {
    this.password = null; // 设置支付密码状态
    this.oldPayPwd = null; // 旧密码
    this.newPayPwd = null; // 新密码
    this.newPayPwdRepeat = null; // 确认新密码
  }

  /**
   * 清空所有状态
   */
  @action
  clear = () => {
    clearInterval(this.timer);
    clearTimeout(this.qrCodeCheckTimer);
    locals.set('PAY_ORDER_INFO', '');
    locals.set('PAY_ORDER_OPTIONS', '');
    this.options = {};
    this.visible = false;
    this.orderInfo = null;
    this.timer = null;
    this.qrCodeCheckTimer = null;
    this.step = STEP_MAP.SURE;
    this.payWay = null;
    this.payResult = null;
    this.password = null;
    this.walletInfo = null;
    this.wechatQRCode = null;
    this.qrCodeTimeout = false;
    this.h5RedirectLink = null;
  }
}

export default PayBoxStore;
