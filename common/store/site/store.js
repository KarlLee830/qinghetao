import { observable, computed } from 'mobx';
import { APP_THEME } from '@common/constants/site';
import { get } from '../../utils/get';

const WECHAT_ENV_MAP = {
  MINI: 'miniProgram',
  OPEN: 'openPlatform',
  NONE: 'none',
};

class SiteStore {
  constructor(props = {}) {
    this.envConfig = props.envConfig;
    this.webConfig = props.webConfig;
    this.platform = props.platform;
    this.pluginConfig = props.pluginConfig;
  }

  envConfig = {};
  @observable webConfig = null;
  @observable platform = null;
  @observable closeSiteConfig = null;
  @observable theme = APP_THEME.light;
  @observable isUserLoginVisible = null;
  @observable errPageType = null;
  @observable pluginConfig = null; // 插件配置
  // @observable pluginStore = {};

  // TODO: 目前报名帖占用，待调整成页面级的
  @observable
  navInfo = {
    statusBarHeight: 44, // 默认的状态栏高度
    navHeight: 40, // 默认的导航栏高度
    menubtnWidth: 80, // 胶囊按钮的宽度
  }

  @computed get isRegister() {
    return !this.isSmsOpen && this.wechatEnv === 'none' && this.registerClose;
  }

  @computed get isPC() {
    return this.platform === 'pc';
  }

  @computed get isSmsOpen() {
    return get(this.webConfig, 'qcloud.qcloudSms', false);
  }

  @computed get isMiniProgramOpen() {
    return Boolean(get(this.webConfig, 'passport.miniprogramOpen', true));
  }
  // 发布帖子时是否需要绑定手机
  @computed get publishNeedBindPhone() {
    return Boolean(get(this.webConfig, 'other.publishNeedBindPhone', false));
  }

  // 发布帖子时是否需要绑定微信
  @computed get publishNeedBindWechat() {
    return Boolean(get(this.webConfig, 'other.publishNeedBindWechat', false));
  }

  // 公众平台是否开启
  @computed get isOffiaccountOpen() {
    return Boolean(get(this.webConfig, 'passport.offiaccountOpen', true));
  }

  // 站点 icon 路径
  @computed get siteIconSrc() {
    return get(this.webConfig, 'setSite.siteLogo');
  }

  // 站点名称
  @computed get siteName() {
    return get(this.webConfig, 'setSite.siteName');
  }

  // 站点版本
  @computed get version() {
    return get(this.webConfig, 'setSite.version');
  }

  // 站点介绍
  @computed get siteIntroduction() {
    return get(this.webConfig, 'setSite.siteIntroduction') || '暂无介绍';
  }

  // 注册协议开关
  @computed get isAgreementRegister() {
    return get(this.webConfig, 'agreement.register', true);
  }

  // 注册协议内容
  @computed get agreementRegisterContent() {
    return get(this.webConfig, 'agreement.registerContent', '');
  }

  // 注册协议内容
  @computed get registerClose() {
    return get(this.webConfig, 'setReg.registerClose', '');
  }

  // 隐私协议开关
  @computed get isAgreementPrivacy() {
    return get(this.webConfig, 'agreement.privacy', true);
  }

  // 隐私协议内容
  @computed get agreementPrivacyContent() {
    return get(this.webConfig, 'agreement.privacyContent', '');
  }

  @computed get cashMinSum() {
    return get(this.webConfig, 'setCash.cashMinSum', 1);
  }

  @computed get wechatEnv() {
    if (this.isMiniProgramOpen) {
      return WECHAT_ENV_MAP.MINI;
    }

    if (this.isOffiaccountOpen) {
      return WECHAT_ENV_MAP.OPEN;
    }

    return WECHAT_ENV_MAP.NONE;
  }

  // 是否开通的云点播
  @computed get isOpenQcloudVod() {
    return get(this.webConfig, 'qcloud.qcloudVod', false);
  }

  // 云点播支持的视频扩展名
  @computed get qcloudVodExt() {
    return get(this.webConfig, 'qcloud.qcloudVodExt', '');
  }

  // 云点播支持的最大尺寸
  @computed get qcloudVodSize() {
    return get(this.webConfig, 'qcloud.qcloudVodSize', '');
  }

  // 是否开启了微信支付
  @computed get isWechatPayOpen() {
    return get(this.webConfig, 'paycenter.wxpayClose', false);
  }

  // IOS 微信支付是否允许
  @computed get isIOSWechatPayOpen() {
    return get(this.webConfig, 'paycenter.wxpayIos', false);
  }

  // 站点背景图
  @computed get siteBackgroundImage() {
    return get(this.webConfig, 'setSite.siteBackgroundImage');
  }

  // 站长
  @computed get siteAuthor() {
    return get(this.webConfig, 'setSite.siteAuthor');
  }

  // 是否付费模式
  @computed get siteMode() {
    return get(this.webConfig, 'setSite.siteMode');
  }

  // 站点付费金额
  @computed get sitePrice() {
    return get(this.webConfig, 'setSite.sitePrice');
  }

  // 站点成员数
  @computed get countUsers() {
    return get(this.webConfig, 'other.countUsers');
  }

  // 站点主题数
  @computed get countThreads() {
    return get(this.webConfig, 'other.countThreads');
  }

  // 站点有效期
  @computed get siteExpire() {
    return get(this.webConfig, 'setSite.siteExpire');
  }

  // 附件上传限制数
  @computed get attachmentLimit() {
    return Number(get(this.webConfig, 'setAttach.supportMaxUploadAttachmentNum', 9));
  }
}

export default SiteStore;
