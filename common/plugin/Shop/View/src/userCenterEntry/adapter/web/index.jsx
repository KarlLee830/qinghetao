import React from 'react';
import { Icon, Dialog } from '@discuzqsdk/design';
import styles from '../index.module.scss';
import Qrcode from '../../../components/qrcode';
import Router from '@discuzqsdk/sdk/dist/router';

export default class UserCenterEntry extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      showPcMiniShop: false,
      miniShopConfig: {},
      visible: false,
    };
  }
  componentDidMount() {
    this.getMiniShopPluginConfig();
  }

  async getMiniShopPluginConfig() {
    const { _pluginInfo, siteData } = this.props;
    const pluginConfig = siteData?.pluginConfig || [];
    const miniShopConfig = pluginConfig.find((config) => config.app_id === _pluginInfo.options.tomId);

    // 后台配置了商城相关配置，才显示商城
    if (
      miniShopConfig?.setting?.publicValue?.wxshopOpen &&
      miniShopConfig?.setting?.publicValue?.wxAppId
    ) {
      this.setState({
        visible: true,
        miniShopConfig,
      });
    }
  }

  handleMiniShopOpen = () => {
    if (this.props.siteData.platform === 'pc') {
      this.handleDialogOpen();
    } else {
      Router.push({ url: '/plugin/minishop/qrcode' });
    }
  };

  handleDialogOpen = () => {
    this.setState({ showPcMiniShop: true });
  };

  handleDialogClose = () => {
    this.setState({ showPcMiniShop: false });
  };

  render() {
    const { dzqRequest, _pluginInfo, siteData, dzqRequestHandleError } = this.props;
    const { visible, showPcMiniShop } = this.state;
    return (
      <>
        {visible && (
          <div
            onClick={this.handleMiniShopOpen}
            className={`${styles.userCenterActionItem} ${siteData.platform === 'pc' ? styles.pc : styles.h5}`}
          >
            <div className={styles.userCenterActionItemIcon}>
              <Icon name="ShopOutlined" size={20} />
            </div>
            <div className={styles.userCenterActionItemDesc}>商城</div>
          </div>
        )}
        <Dialog visible={showPcMiniShop} width={409} maskClosable onClose={this.handleDialogClose}>
          <div className={styles['qrcode-title']}>
            <Icon
              onClick={this.handleDialogClose}
              name="CloseOutlined"
              size={12}
              className={styles['dzq-qrcode-close']}
            />
          </div>
          <Qrcode
            dzqRequest={dzqRequest}
            _pluginInfo={_pluginInfo}
            siteData={siteData}
            dzqRequestHandleError={dzqRequestHandleError}
          />
        </Dialog>
      </>
    );
  }
}
