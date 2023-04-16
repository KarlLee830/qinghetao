import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Toast, Icon } from '@discuzqsdk/design';
import styles from './index.module.scss';
import JoinBanner from '@components/join-banner-pc';
import WeixinQrCode from '@components/login/wx-qr-code';
import { get } from '@common/utils/get';
import Router from '@discuzqsdk/sdk/dist/router';
import PcBodyWrap from '../components/pc-body-wrap';

@inject('site')
@inject('user')
@observer
class RebindPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      explain: [
        '电脑登录站点',
        '进入个人中心-编辑资料-微信换绑',
        '手机登录新微信扫码完成换绑'
      ],
      currentStatus: '',
      errorTips: '扫码失败',
    };

  }

  async componentDidMount() {
    this.props.site.platform === 'pc' && await this.generateQrCode();
  }

  componentWillUnmount() {
    this.props.user.clearWechatRebindTimer();
  }

  async generateQrCode() {
    try {
      const { wechatEnv } = this.props.site;
      const { user } = this.props;
      const redirectUri = `${wechatEnv === 'miniProgram' ? 'userPages/user/wx-rebind-action/index' : `${window.location.origin}/user/wx-rebind-action`}`;
      await user.genRebindQrCode({
        scanSuccess: this.scanSuccess,
        scanFail: this.scanFail,
        option: {
          params: {
            redirectUri: encodeURIComponent(redirectUri),
          }
        },
      });
    } catch (e) {
      Toast.error({
        content: e.Msg,
        hasMask: false,
        duration: 1000,
      });
    }
  }

  scanSuccess = async () => {
    const { user } = this.props;
    this.setState({
      currentStatus: 'success'
    });
    // TODO 几秒钟跳转需要确认
    setTimeout(() => {
      user.id && user.updateUserInfo(user.id);
      Router.back();
    }, 3000);
  }

  async scanFail(e) {
    console.error(e);
  }

  render() {
    const { site, user } = this.props;
    const { currentStatus, explain, errorTips } = this.state;
    const { platform } = site;

    if (platform === 'h5') {
      return (
        <PcBodyWrap>
          <JoinBanner />
          <div className={styles.content}>
            <div className={styles.title}>换绑流程说明</div>
            {
              explain.map((item, index) => (
                <div key={index} className={styles.rebind_explain_list}>
                  <div className={styles.rebind_explain_index}>{index + 1}</div>
                  <div className={styles.rebind_explain_value}>{item}</div>
                </div>
              ))
            }
          </div>
        </PcBodyWrap>
      );
    }

    return (
      <PcBodyWrap>
      <div className={styles.pc_container}>
        <JoinBanner />
        <div
            className={styles.userCenterReturn}
            onClick={() => {
              Router.back();
            }}
          >
            <Icon name="ReturnOutlined" size={16} className={styles.userCenterReturnIcon} />
            返回我的主页
          </div>
        <div className={styles.pc_content}>
          <div className={styles.pc_title}>{currentStatus === 'success' ? '换绑成功' : '微信换绑'}</div>
          {/* 二维码 start */}
          {
            !currentStatus
            && <WeixinQrCode
                  refresh={() => {this.generateQrCode()}}
                  isValid={user.isQrCodeValid}
                  orCodeImg={user.rebindQRCode}
                  orCodeTips='请用新微信扫码完成换绑'
                />
          }
          {/* 二维码 end */}
          {/* 状态图标 start */}
          {
            currentStatus
            && <div className={styles.statusWrap}>
                { currentStatus === 'success' && <Icon color='#3AC15F' name="SuccessOutlined" size={80} className={styles.statusIcon} /> }
                { currentStatus === 'error' && <Icon color='#E02433' name="WrongOutlined" size={80} className={styles.statusIcon} /> }
                <p className={styles.hint}>请将已登录设备退出登录</p>
                <p className={styles.statusBottom}>
                  { currentStatus === 'success'
                    ? <>
                        <Icon name="FunnelOutlined" size={18} className={styles.statusBottomIcon} />
                        页面自动跳转中…
                        </>
                    : errorTips
                  }
                </p>
              </div>
          }
          {/* 状态图标 end */}
        </div>

      </div>
      </PcBodyWrap>
    );
  }
}

export default withRouter(RebindPage);
