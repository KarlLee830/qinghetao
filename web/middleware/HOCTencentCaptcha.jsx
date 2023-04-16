import React from 'react';
import { inject } from 'mobx-react';

export default function HOCTencentCaptcha(Component) {
  @inject('site')

  class HOCTencentCaptchaComponent extends React.Component {
    tcaptcha = null;
    qcloudCaptcha = false;

    componentDidMount() {
      this.loadTencentCaptcha();
    }


    loadTencentCaptcha = () => {
      const { webConfig } = this.props.site;
      this.qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;

      if (!this.qcloudCaptcha) return;
      if (typeof window === 'undefined' || window.TencentCaptcha) return;
      const script = window.document.createElement('script');
      script.src = 'https://ssl.captcha.qq.com/TCaptcha.js';
      script.async = true;
      window.document.body.append(script);
    }

    showCaptcha = () => new Promise((resolve, reject) => {
      if (!this.qcloudCaptcha) {
        resolve({
          captchaRandStr: '',
          captchaTicket: '',
        });
        return;
      }

      if (!window.TencentCaptcha)  {
        reject({ Code: 'captcha_not_available', Message: '图形验证码加载失败，请刷新页面' });
        return;
      }

      const qcloudCaptchaAppId = this.props.site?.webConfig?.qcloud?.qcloudCaptchaAppId;
      this.tcaptcha = new window.TencentCaptcha(qcloudCaptchaAppId, (res) => {
        if (res.ret === 0) {
          return resolve({
            captchaRandStr: res.randstr,
            captchaTicket: res.ticket,
          });
        } else {
          return reject(false);
        }
      });
      // 显示验证码
      this.tcaptcha.show();
    })

    render() {
      return <Component {...this.props} showCaptcha={this.showCaptcha} /> ;
    }
  }

  return HOCTencentCaptchaComponent;
}
