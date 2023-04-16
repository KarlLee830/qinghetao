import { observable, computed } from 'mobx';
import { get } from '../../utils/get';
import { defaultOperation } from '../../constants/const';
import { THREAD_TYPE } from '../../constants/thread-post';

const noop = () => {};

class UserStore {
  constructor(props) {
    this.userInfo = props.userInfo ? props.userInfo : null;
  }

  rebindTimer = null;

  // login 监听方法，由外层实现
  @observable onLoginCallback = noop;

  @observable userInfo = null;
  @observable loginStatus = false;
  @observable accessToken = null;
  @observable weixinNickName = null;
  @observable permissions = null;
  @observable shareNickname = '';
  @observable shareAvatar = '';
  @observable shareThreadid = '';
  @observable shareContent = '';
  @observable userThreads = {};
  @observable userThreadsPage = 1;
  @observable userThreadsTotalCount = 0;
  @observable userThreadsTotalPage = 1;

  // 付费用户组
  @observable payGroups = [];

  @observable userLikes = {};

  // 编辑模式下的 username
  @observable editUserName = '';

  // 编辑模式下的昵称
  @observable editNickName = '';

  // 编辑模式下的签名
  @observable editSignature = '';

  // 用户头像
  @observable editAvatarUrl = null;

  // 用户背景图
  @observable editBackgroundUrl = null;

  // 换绑 QRCode
  @observable rebindQRCode = null;

  // 换绑 QRCode是否有效
  @observable isQrCodeValid = true;

  // 用户注册扩展信息
  @observable userSigninFields = [];

  // 检索的目标用户，非自己
  @observable targetUser = null;

  // 检索的目标用户id
  @observable targetUserId = null;

  @observable targetUserThreads = {};
  @observable targetUserThreadsPage = 1;
  @observable targetUserThreadsTotalCount = 0;
  @observable targetUserThreadsTotalPage = 1;

  /**
   * 重设用户密码时使用
   */
  @observable oldPassword = '';
  @observable newPassword = '';
  @observable newPasswordRepeat = '';

  /**
   * 修改用户手机号时使用
   * 老的手机号使用 computed 中的 mobile
   * 新的手机号绑定至 newMobile 中
   * 以下两个验证码分别为验证老手机号的验证码和验证新手机号的验证码
   */
  @observable newMobile = '';

  @observable oldMobileVerifyCode = '';
  @observable newMobileVerifyCode = '';

  oldCodeTimer = null;
  @observable oldCodeTimeout = null;

  newCodeTimer = null;
  @observable newCodeTimeout = null;

  // 我的屏蔽 数据设计
  @observable userShield = []; // 用户屏蔽列表

  // 触底加载条件 当加载的页数超过总页数的时候就没有更多了
  @observable userShieldPage = 1; // 页码
  @observable userShieldTotalPage = 1; // 总页数
  @observable userShieldTotalCount = 0; // 总条数

  // target user 数据表，以 user id 作为映射
  @observable targetUsers = {};

  // 关注数据表，以 user id 作为映射
  @observable followStore = {};

  // 粉丝数据表，以 user id 作为映射
  @observable fansStore = {};


  @computed get userStatus() {
    return get(this.userInfo, 'status');
  }
  // 是否能使用钱包支付
  @computed get canWalletPay() {
    return get(this.userInfo, 'canWalletPay');
  }

  @computed get id() {
    return get(this.userInfo, 'id');
  }

  // 关注数
  @computed get followCount() {
    return get(this.userInfo, 'followCount');
  }

  // 粉丝数
  @computed get fansCount() {
    return get(this.userInfo, 'fansCount');
  }

  // 点赞数
  @computed get likedCount() {
    return get(this.userInfo, 'likedCount');
  }

  // 用户名称
  @computed get username() {
    return get(this.userInfo, 'username');
  }

  // 昵称
  @computed get nickname() {
    return get(this.userInfo, 'nickname');
  }

  // 背景图地址
  @computed get backgroundUrl() {
    return get(this.userInfo, 'backgroundUrl');
  }

  // 获取用户原背景图
  @computed get originalBackGroundUrl() {
    return get(this.userInfo, 'originalBackGroundUrl');
  }

  // 用户签名
  @computed get signature() {
    return get(this.userInfo, 'signature');
  }

  // 用户头像
  @computed get avatarUrl() {
    return get(this.userInfo, 'avatarUrl');
  }
  // 用户原头像
  @computed get originalAvatarUrl() {
    return get(this.userInfo, 'originalAvatarUrl');
  }

  // 用户手机号
  @computed get mobile() {
    return get(this.userInfo, 'mobile');
  }

  // 用户是否绑定微信
  @computed get isBindWechat() {
    return get(this.userInfo, 'isBindWechat');
  }

  // 获取实际用户手机号
  @computed get originalMobile() {
    return get(this.userInfo, 'originalMobile');
  }

  // 获取绑定微信内容
  @computed get unionid() {
    return get(this.userInfo, 'unionid');
  }

  // 获取用户的用户组
  @computed get group() {
    return get(this.userInfo, 'group');
  }

  // 获取用户是否付费
  @computed get paid() {
    return get(this.userInfo, 'paid');
  }

  // 获取用户微信昵称
  @computed get wxNickname() {
    return get(this.userInfo, 'wxNickname');
  }

  // 获取用户微信头像
  @computed get wxHeadImgUrl() {
    return get(this.userInfo, 'wxHeadImgUrl');
  }

  // 用户是否可以编辑用户名
  // 规则为一年一次
  @computed get canEditUsername() {
    return get(this.userInfo, 'canEditUsername');
  }

  // 目标用户关注数editorConfig
  @computed get targetUserFollowCount() {
    return get(this.targetUser, 'followCount');
  }

  // 目标用户粉丝数
  @computed get targetUserFansCount() {
    return get(this.targetUser, 'fansCount');
  }

  // 目标用户点赞数
  @computed get targetUserLikedCount() {
    return get(this.targetUser, 'likedCount');
  }

  // 目标用户名称
  @computed get targetUserUsername() {
    return get(this.targetUser, 'username');
  }

  // 目标用户昵称
  @computed get targetUserNickname() {
    return get(this.targetUser, 'nickname');
  }

  // 目标用户背景图地址
  @computed get targetUserBackgroundUrl() {
    return get(this.targetUser, 'backgroundUrl');
  }

  // 获取他人原背景图
  @computed get targetOriginalBackGroundUrl() {
    return get(this.targetUser, 'originalBackGroundUrl');
  }

  // 目标用户签名
  @computed get targetUserSignature() {
    return get(this.targetUser, 'signature');
  }

  // 目标用户头像
  @computed get targetUserAvatarUrl() {
    return get(this.targetUser, 'avatarUrl');
  }

  // 获取他人原头像
  @computed get targetOriginalAvatarUrl() {
    return get(this.targetUser, 'originalAvatarUrl');
  }

  // 目标用户手机号
  @computed get targetUserMobile() {
    return get(this.targetUser, 'mobile');
  }

  // 目标用户被屏蔽状态
  @computed get targetUserDenyStatus() {
    return get(this.targetUser, 'isDeny');
  }

  // 判断用户是否存在用户密码
  @computed get hasPassword() {
    return get(this.userInfo, 'hasPassword');
  }

  // 判断当前用户是否管理员
  @computed get isAdmini() {
    return get(this.userInfo, 'group.groupId') === 1;
  }

  // 用户角色分类
  @computed get groupName() {
    return get(this.userInfo, 'group.groupName')
  }

  // 站点到期天数
  @computed get expiredDays() {
    return get(this.userInfo, 'expiredDays')
  }

  // 站点剩余时间
  @computed get expiredAt() {
    return get(this.userInfo, 'expiredAt')
  }

  // 判断是否是无限期
  @computed get isIndefiniteDuration() {
    return Number(get(this.userInfo, 'expiredDays')) >= 10000
  }

  // 发帖扩展的权限
  @computed get threadExtendPermissions() {
    const { permissions: pm } = this;

    return {
      [defaultOperation.emoji]: true,
      [defaultOperation.at]: true,
      [defaultOperation.topic]: true,
      [defaultOperation.attach]: get(pm, 'insertAttachment.enable'),
      [defaultOperation.pay]: get(pm, 'insertPay.enable'),
      [defaultOperation.redpacket]: get(pm, 'insertRedPacket.enable'),
      [THREAD_TYPE.image]: get(pm, 'insertImage.enable'),
      [THREAD_TYPE.video]: get(pm, 'insertVideo.enable'),
      [THREAD_TYPE.vote]: get(pm, 'insertVote.enable'),
      [THREAD_TYPE.voice]: get(pm, 'insertAudio.enable'),
      [THREAD_TYPE.goods]: get(pm, 'insertGoods.enable'),
      [THREAD_TYPE.reward]: get(pm, 'insertReward.enable'),
      [THREAD_TYPE.anonymity]: get(pm, 'allowAnonymous.enable'),
      createThread: get(pm, 'createThread.enable'),
    };
  }
}

export default UserStore;
