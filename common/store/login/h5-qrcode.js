import { observable, action, computed } from 'mobx';
import { genH5Qrcode, h5QrcodeLogin, miniQrcodeLogin, genMiniQrcode, h5QrcodeBind, miniQrcodeBind } from '@server';
import setAccessToken from '../../utils/set-access-token';
import { get } from '../../utils/get';
import { checkUserStatus } from '@common/store/login/util';

const WAITING_FOR_SCANNING = -7002;
const COUNT_DOWN_OF_SECONDS = 4 * 60; // 默认4min

export default class H5Qrcode {
  @observable qrCode = '';
  @observable sessionToken = '';
  @observable countDown = COUNT_DOWN_OF_SECONDS;
  @observable bindTitle = '请绑定您的微信';
  @observable isBtn = true;
  countDownOfSeconds = COUNT_DOWN_OF_SECONDS; // 有效期，单位s

  // 二维码是否有效
  @computed get isQrCodeValid() {
    return this.countDown  > 0;
  }

  @action
  resetCountDown() {
    this.countDown = this.countDownOfSeconds;
  }

  @action
  async generate(opts) {
    try {
      const { type } = opts.params;
      const req = (type.indexOf('mini') > -1) ? genMiniQrcode : genH5Qrcode;
      const res = await req({
        ...opts,
      });
      if (res.code === 0) {
        this.qrCode = res.data.base64Img;
        this.sessionToken = res.data.sessionToken;
        this.resetCountDown();
        return;
      }
      throw {
        Code: res.code,
        Message: res.msg,
      };
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        Code: 'ulg_9999',
        Message: '网络错误',
        error,
      };
    }
  }
  @action
  async login(opts) {
    try {
      const { type } = opts;
      const req = (type.indexOf('mini') > -1) ? miniQrcodeLogin : h5QrcodeLogin;
      const res = await req({

        ...opts,
      });
      checkUserStatus(res);
      if (res.code === 0) {
        const accessToken = get(res, 'data.accessToken', '');
        setAccessToken({
          accessToken,
        });
        return res;
      }

      throw {
        Code: res.code,
        Message: res.msg,
      };
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        Code: 'ulg_9999',
        Message: '网络错误',
        error,
      };
    }
  }
  @action
  async bind(opts) {
    try {
      const { type } = opts;
      const req = (type.indexOf('mini') > -1) ? miniQrcodeBind : h5QrcodeBind;
      const res = await req({

        ...opts,
      });
      checkUserStatus(res);
      if (res.code === 0) {
        const accessToken = get(res, 'data.accessToken', '');
        setAccessToken({
          accessToken,
        });
        return res;
      }

      throw {
        Code: res.code,
        Message: res.msg,
      };
    } catch (error) {
      if (error.Code) {
        throw error;
      }
      throw {
        Code: 'ulg_9999',
        Message: '网络错误',
        error,
      };
    }
  }
}
