import React from 'react';
import { Icon, Spin } from '@discuzqsdk/design';
import styles from '../index.module.scss';

export default class Qrcode extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      miniShopConfig: {},
      isQrcodeError: false,
      loading: false,
    };
  }

  componentDidMount() {
    this.getMiniShopPluginConfig();
  }

  async openMiniShop(miniShopConfig) {
    if (miniShopConfig?.setting?.publicValue?.wxScheme) {
      window.location.href = miniShopConfig.setting.publicValue.wxScheme;
    }
  }

  async getMiniShopPluginConfig() {
    const { siteData } = this.props;
    let pluginConfig = siteData?.pluginConfig || [];
    const miniShopConfig = this.findShopPluginConfg(pluginConfig);
    siteData.platform === 'h5' && this.openMiniShop(miniShopConfig);
  }

  findShopPluginConfg(pluginConfig) {
    const { _pluginInfo } = this.props;
    let miniShopConfig = {};
    if (pluginConfig && pluginConfig.length) {
      miniShopConfig = pluginConfig.find((config) => config.app_id === _pluginInfo.options.tomId);
    }
    this.setState({
      miniShopConfig,
    });
    return miniShopConfig;
  }

  handleQrcodeOnError = () => {
    this.setState({
      isQrcodeError: true,
    });
  };

  handleQrcodeOnLoad = () => {
    this.setState({
      isQrcodeError: false,
    });
  };

  handleQrcodeRefresh = async () => {
    this.setState({
      loading: true,
    });
    const { dzqRequest, dzqRequestHandleError } = this.props;
    try {
      const { code, data, msg } = await dzqRequest.request.http({
        url: '/api/v3/plugin/list',
        method: 'GET',
      });

      if (code !== 0) {
        Toast.error({
          content: msg,
        });
      }
      this.handleQrcodeOnLoad();
      this.findShopPluginConfg(data);
      this.setState({
        loading: false,
      });
    } catch (error) {
      this.setState({
        loading: false,
      });
      dzqRequestHandleError(error);
    }
  };

  renderQrcodeError() {
    const { isQrcodeError } = this.state;
    if (isQrcodeError) {
      return (
        <div className={styles['dzq-qrcode-error-border']}>
          <div className={styles['dzq-qrcode-error-box']}>
            {!this.state.loading && (
              <>
                <Icon className={styles['dzq-qrcode-error-icon']} name="PictureErrorOutlined" size={50} />
                <span className={styles['dzq-qrcode-error-msg']}>二维码加载失败</span>
                <a
                  href="javascript:void(0)"
                  onClick={this.handleQrcodeRefresh}
                  className={`${styles['dzq-qrcode-error-msg']} ${styles['dzq-qrcode-refresh']}`}
                >
                  刷新
                </a>
              </>
            )}
            {this.state.loading && <Spin type="spinner">加载中...</Spin>}
          </div>
        </div>
      );
    }
  }

  renderNoQrcode () {
    return (
      <div className={styles['dzq-qrcode-error-border']}>
        <div className={styles['dzq-qrcode-error-box']}>
          <span className={styles['dzq-no-qrcode-msg']}>未配置商城二维码</span>
        </div>
      </div>
    )
  }

  renderQrcode(wxQrcode) {
    const { siteData } = this.props;
    return (
      <>
        <img
          className={styles['dzq-qrcode-img']}
          src={wxQrcode}
          onLoad={this.handleQrcodeOnLoad}
          onError={this.handleQrcodeOnError}
          alt="二维码"
        />
        {siteData.platform === 'pc' ? (
          <span className={`${styles['dzq-qrcode-msg']} ${styles.pc}`}>
            <Icon name="ScanOutlined" size={16} className={styles['dzq-qrcode-scan-icon']} />
            扫码访问商城
          </span>
        ) : (
          <span className={`${styles['dzq-qrcode-img-msg']} ${styles.h5}`}>
            <span>长按保存二维码</span>
            <span>使用微信扫码访问</span>
          </span>
        )}
      </>
    );
  }

  render() {
    const { miniShopConfig, isQrcodeError } = this.state;
    const wxQrcode = miniShopConfig?.setting?.publicValue?.wxQrcode;
    return (
      <div className={styles['dzq-qrcode-box']}>
        { wxQrcode && !isQrcodeError && this.renderQrcode(wxQrcode) }
        { wxQrcode && isQrcodeError && this.renderQrcodeError() }
        { !wxQrcode && this.renderNoQrcode() }
      </div>
    );
  }
}
