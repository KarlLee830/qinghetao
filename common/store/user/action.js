import { action } from 'mobx';
import SiteStore from './store';
import {
  readUser,
  readPermissions,
  createFollow,
  deleteFollow,
  getUserFollow,
  getUserFans,
  readThreadList,
  denyUser,
  deleteDeny,
  updateAvatar,
  updateBackground,
  updateUsersUpdate,
  smsSend,
  smsRebind,
  smsVerify,
  readUsersDeny,
  wechatRebindQrCodeGen,
  getWechatRebindStatus,
  getSignInFields,
  h5Rebind,
  miniRebind,
  getPayGroups
} from '@server';
import { get } from '../../utils/get';
import locals from '@common/utils/local-bridge';
import constants from '@common/constants';

class UserAction extends SiteStore {
  constructor(props) {
    super(props);
  }

  // 获取指定 userid 的 用户信息
  @action
  async getTargetUserInfo({ userId }) {
    const targetUserInfo = await this.getAssignUserInfo(userId);

    if (targetUserInfo) {
      if (!this.targetUsers[userId]) {
        this.targetUsers[userId] = targetUserInfo;
      } else {
        if (targetUserInfo.backgroundUrl && this.targetUsers[userId].backgroundUrl) {
          const originBackgroundFilename = this.targetUsers[userId].backgroundUrl?.split('?')[0];
          const nextBackgroundFilename = targetUserInfo.backgroundUrl?.split('?')[0];

          if (originBackgroundFilename === nextBackgroundFilename) {
            targetUserInfo.backgroundUrl = this.targetUsers[userId].backgroundUrl;
          }
        }

        if (targetUserInfo.avatarUrl && this.targetUsers[userId].avatarUrl) {
          const originAvatarFilename = this.targetUsers[userId].avatarUrl?.split('?')[0];
          const nextAvatarFilename = targetUserInfo.avatarUrl?.split('?')[0];

          if (originAvatarFilename === nextAvatarFilename) {
            targetUserInfo.avatarUrl = this.targetUsers[userId].avatarUrl;
          }
        }

        this.targetUsers[userId] = targetUserInfo;
      }

      this.targetUsers = { ...this.targetUsers };
    }
  }

  // 获取付费用户组信息
  @action
  async queryPayGroups() {
    if (this.payGroups?.length) return this.payGroups;
    const res = await getPayGroups();
    const { code, data } = res;
    if (code === 0) {
      this.payGroups = data || [];
      return data;
    }
  }

  // 更新指定 userid 的 用户信息
  @action
  updateTargetUserInfo({ userId, userInfo }) {
    this.targetUsers[userId] = userInfo;
    this.targetUsers = { ...this.targetUsers };
  }

  // 删除指定 userid 的 用户信息
  @action
  deleteTargetUserInfo({ userId }) {
    if (!this.targetUsers[userId]) return;
    delete this.targetUsers[userId];

    this.targetUsers = { ...this.targetUsers };
  }

  // 获取用户的关注者
  @action
  async getUserFollowers({ userId, page, searchValue }) {
    this.initFollowersStore({ userId });

    const opts = {
      params: {
        page: page,
        perPage: 20,
        filter: {
          userId: userId,
        },
      },
    };

    if (searchValue) {
      opts.params.filter['nickName'] = searchValue;
    }

    return await getUserFollow(opts);
  }

  @action
  initFollowersStore({ userId }) {
    if (!this.followStore[userId]) {
      this.followStore[userId] = {
        data: {},
        attribs: {},
      };
    }

    this.followStore = { ...this.followStore };
  }

  @action
  setUserFollowers({ userId, page, followersData }) {
    this.initFollowersStore({ userId });
    this.followStore[userId].data[page] = get(followersData, 'data.pageData', []);

    this.followStore[userId].attribs.totalPage = get(followersData, 'data.totalPage', 1);
    this.followStore[userId].attribs.totalCount = get(followersData, 'data.totalCount', 0);

    if (!this.followStore[userId].attribs.currentPage) {
      this.followStore[userId].attribs.currentPage = get(followersData, 'data.currentPage', 1);
    } else {
      const prevCurrentPage = this.followStore[userId].attribs.currentPage;
      const currentPage = get(followersData, 'data.currentPage', 1);

      if (Number(currentPage) > prevCurrentPage) {
        this.followStore[userId].attribs.currentPage = get(followersData, 'data.currentPage');
      }
    }
    this.followStore = { ...this.followStore };
  }

  @action
  clearUserFollowers({ userId }) {
    if (!this.followStore[userId]) return;
    this.followStore[userId] = null;
    this.followStore = { ...this.followStore };
  }

  // 获取用户的粉丝
  @action
  async getUserFanses({ userId, page }) {
    const opts = {
      params: {
        page: page,
        perPage: 20,
        filter: {
          userId: userId,
        },
      },
    };

    this.initFansesStore({ userId });

    return await getUserFans(opts);
  }

  @action
  initFansesStore({ userId }) {
    if (!this.fansStore[userId]) {
      this.fansStore[userId] = {
        data: {},
        attribs: {},
      };
    }
    this.fansStore = { ...this.fansStore };
  }

  @action
  setUserFanses({ userId, page, fansData }) {
    this.initFansesStore({ userId });
    this.fansStore[userId].data[page] = get(fansData, 'data.pageData', []);

    this.fansStore[userId].attribs.totalPage = get(fansData, 'data.totalPage', 1);
    this.fansStore[userId].attribs.totalCount = get(fansData, 'data.totalCount', 0);

    if (!this.fansStore[userId].attribs.currentPage) {
      this.fansStore[userId].attribs.currentPage = get(fansData, 'data.currentPage', 1);
    } else {
      const prevCurrentPage = this.fansStore[userId].attribs.currentPage;
      const currentPage = get(fansData, 'data.currentPage', 1);

      if (Number(currentPage) > prevCurrentPage) {
        this.fansStore[userId].attribs.currentPage = get(fansData, 'data.currentPage');
      }
    }
    this.fansStore = { ...this.fansStore };
  }

  @action
  findAssignedUserInFollowersAndFans({ userId }) {
    const resultArray = [];
    Object.values(this.followStore).forEach((follows) => {
      if (follows && follows.data) {
        Object.keys(follows.data).forEach((page) => {
          follows.data[page].forEach((userInfo) => {
            if (get(userInfo, 'user.userId') !== userId) return;

            resultArray.push(userInfo);
          });
        });
      }
    });

    Object.values(this.fansStore).forEach((fans) => {
      if (fans && fans.data) {
        Object.keys(fans.data).forEach((page) => {
          fans.data[page].forEach((userInfo) => {
            if (get(userInfo, 'user.userId') !== userId) return;

            resultArray.push(userInfo);
          });
        });
      }
    });

    return resultArray;
  }

  @action
  clearUserFanses({ userId }) {
    if (!this.fansStore[userId]) return;
    this.fansStore[userId] = null;
    this.fansStore = { ...this.fansStore };
  }

  // 关注某个用户
  @action
  followUser({ userId, followRes }) {
    const followTransformer = (userInfo) => {
      if (get(userInfo, 'user.userId') !== userId) return;
      userInfo.userFollow.isMutual = followRes.data.isMutual;
      userInfo.userFollow.isFollow = true;
    };

    Object.values(this.followStore).forEach((follows) => {
      if (follows && follows.data) {
        Object.keys(follows.data).forEach((page) => {
          follows.data[page].forEach((userInfo) => {
            followTransformer(userInfo);
          });
        });
      }
    });

    Object.values(this.fansStore).forEach((fans) => {
      if (fans && fans.data) {
        Object.keys(fans.data).forEach((page) => {
          fans.data[page].forEach((userInfo) => {
            followTransformer(userInfo);
          });
        });
      }
    });

    if (this.followStore[this.id] && this.followStore[this.id].data) {
      let searchFlag = false;
      Object.keys(this.followStore[this.id].data).forEach((page) => {
        this.followStore[this.id].data[page].forEach((userInfo) => {
          if (userInfo.user.userId === userId) {
            searchFlag = true;
          }
        });
      });

      if (!searchFlag) {
        const { currentPage = 1 } = this.followStore[this.id].attribs;

        const findResult = this.findAssignedUserInFollowersAndFans({ userId });

        if (findResult.length > 0) {
          this.followStore[this.id].data[currentPage].push(findResult[0]);
        }
      }

      if (this.targetUsers[userId]) {
        if (followRes && followRes.data && followRes.data.isMutual) {
          this.targetUsers[userId].follow = 2;
        } else {
          this.targetUsers[userId].follow = 1;
        }
      }
    }

    if (this.userInfo) {
      this.userInfo.followCount += 1;
    }

    this.followStore = { ...this.followStore };
    this.fansStore = { ...this.fansStore };
  }

  // 取消关注某个用户
  @action
  unFollowUser({ userId }) {
    const unfollowTransformer = (userInfo) => {
      if (get(userInfo, 'user.userId') !== userId) return;
      userInfo.userFollow.isFollow = false;
    };

    Object.values(this.followStore).forEach((follows) => {
      if (follows && follows.data) {
        Object.keys(follows.data).forEach((page) => {
          follows.data[page].forEach((userInfo) => {
            unfollowTransformer(userInfo);
          });
        });
      }
    });

    Object.values(this.fansStore).forEach((fans) => {
      if (fans && fans.data) {
        Object.keys(fans.data).forEach((page) => {
          fans.data[page].forEach((userInfo) => {
            unfollowTransformer(userInfo);
          });
        });
      }
    });

    if (this.userInfo) {
      this.userInfo.followCount -= 1;

      // 如果删除为 0，清空 followers
      if (this.userInfo.followCount === 0) {
        this.clearUserFollowers({ userId: this.id });
      }
    }

    if (this.targetUsers[userId]) {
      this.targetUsers[userId].follow = 0;
    }

    this.followStore = { ...this.followStore };
    this.fansStore = { ...this.fansStore };
  }

  @action
  removeUserInfo() {
    this.userInfo = null;
    this.loginStatus = false;
    this.accessToken = null;
  }

  // 写入用户数据
  @action
  setUserInfo(data) {
    if (data) {
      if (!this.userInfo) {
        this.userInfo = data;
      } else {
        Object.keys(data).forEach((key) => {
          this.userInfo[key] = data[key];
        });
      }
      if (data && data.id) {
        this.updateLoginStatus(true);
      } else {
        this.updateLoginStatus(false);
      }
    }
  }

  // 写入用户发帖权限
  @action
  async setUserPermissions(data) {
    this.permissions = data;
  }

  // 获取用户分享时的名称和头像
  @action.bound
  getShareData(data) {
    this.shareNickname = data.nickname;
    this.shareAvatar = data.avatar;
    this.shareThreadid = data.threadId;
  }

  // 获取用户分享前的内容
  @action.bound
  getShareContent(data) {
    this.shareThreadid = data.threadId;
    this.shareContent = data.content;
  }

  // 初始化编辑用用户信息
  @action
  initEditInfo() {
    this.editNickName = get(this.userInfo, 'nickname');
    this.editUserName = get(this.userInfo, 'username');
    this.editSignature = get(this.userInfo, 'signature');
    // this.editAvatarUrl = get(this.userInfo, 'avatarUrl');
    // this.editBackgroundUrl = get(this.userInfo, 'backgroundUrl');
  }

  @action
  diffPicAndUpdateUserInfo(data) {
    const transformedData = Object.assign({}, data);

    // 如下操作是为了避免因为签名导致的图片重加载问题
    if (data.backgroundUrl && this.backgroundUrl) {
      const originBackgroundFilename = this.backgroundUrl?.split('?')[0];
      const nextBackgroundFilename = data.backgroundUrl?.split('?')[0];

      if (originBackgroundFilename === nextBackgroundFilename) {
        transformedData.backgroundUrl = this.backgroundUrl;
      }
    }

    if (data.avatarUrl && this.avatarUrl) {
      const originAvatarFilename = this.avatarUrl?.split('?')[0];
      const nextAvatarFilename = data.avatarUrl?.split('?')[0];

      if (originAvatarFilename === nextAvatarFilename) {
        transformedData.avatarUrl = this.avatarUrl;
      }
    }

    this.setUserInfo(transformedData);
  }

  // 登录后获取新的用户信息
  @action
  async updateUserInfo(id) {
    const userInfo = await readUser({ params: { userId: id } });
    if (!userInfo || userInfo?.code !== 0) {
      return;
    }

    if (!this.id && this.onLoginCallback) {
      this.onLoginCallback(userInfo.data);
    }
    const userPermissions = await readPermissions({});
    userInfo?.data && this.diffPicAndUpdateUserInfo(userInfo.data);
    userPermissions?.data && this.setUserPermissions(userPermissions.data);

    return userInfo?.code === 0 && userInfo.data;
  }

  @action
  getUserFollow = async () => {
    const followsRes = await getUserFollow({
      params: {
        page: this.userFollowsPage,
        perPage: 20,
      },
    });

    if (followsRes.code !== 0) {
      return;
    }

    const pageData = get(followsRes, 'data.pageData', []);
    const totalPage = get(followsRes, 'data.totalPage', 1);
    this.userFollowsTotalPage = totalPage;
    this.userFollows[this.userFollowsPage] = pageData;
    if (this.userFollowsPage <= this.userFollowsTotalPage) {
      this.userFollowsPage += 1;
    }
    this.userFollows = { ...this.userFollows };
  };

  /**
   * 取消屏蔽指定 id 的用户
   * @param {*} id
   */
  @action
  async undenyUser(id) {
    const deleteDenyRes = await deleteDeny({
      data: {
        id,
      },
    });

    if (deleteDenyRes.code === 0) {
      return deleteDenyRes.data;
    }

    throw {
      Code: deleteDenyRes.code,
      Msg: deleteDenyRes.msg,
    };
  }

  /**
   * 屏蔽指定  id 的用户
   * @param {*} id
   */
  @action
  async denyUser(id) {
    const denyUserRes = await denyUser({
      data: {
        id,
      },
    });

    if (denyUserRes.code === 0) {
      return denyUserRes.data;
    }

    throw {
      Code: denyUserRes.code,
      Msg: denyUserRes.msg,
    };
  }

  // 更新是否没有用户数据状态
  @action
  updateLoginStatus(isLogin) {
    this.loginStatus = isLogin;
  }

  @action
  removeUserInfo() {
    this.userInfo = null;
    this.permissions = null;
    this.noUserInfo = false;
  }

  @action
  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  // 判断用户是否登录
  @action
  isLogin() {
    if (process.env.DISCUZ_ENV !== 'web') {
      return !!locals.get(constants.ACCESS_TOKEN_NAME);
    }

    return !!this.userInfo && !!this.userInfo.id;
  }

  @action
  isPaid() {
    return !!this.userInfo && !!this.userInfo.paid;
  }

  // 获取指定用户信息
  @action
  async getAssignUserInfo(userId) {
    try {
      const userInfo = await readUser({ params: { userId: userId } });
      if (userInfo.code === 0 && userInfo.data) {
        return userInfo.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  @action
  setTargetUserDenied({ userId }) {
    if (this.targetUsers[userId]) {
      this.targetUsers[userId].isDeny = true;
    }

    this.targetUsers = { ...this.targetUsers };
  }

  @action
  setTargetUserNotBeDenied({ userId }) {
    if (this.targetUsers[userId]) {
      this.targetUsers[userId].isDeny = false;
    }

    this.targetUsers = { ...this.targetUsers };
  }

  /**
   * 关注
   * @param {object} userId * 被关注人id
   * @returns {object} 处理结果
   */
  @action
  async postFollow(userId) {
    const res = await createFollow({ data: { toUserId: userId } });
    if (res.code === 0 && res.data) {
      return {
        msg: '操作成功',
        data: res.data,
        success: true,
      };
    }
    return {
      msg: res.msg,
      data: null,
      success: false,
    };
  }

  /**
   * 取消关注
   * @param {object} search * 搜索值
   * @returns {object} 处理结果
   */
  @action
  async cancelFollow({ id, type }) {
    const res = await deleteFollow({ data: { id, type } });
    if (res.code === 0 && res.data) {
      return {
        msg: '操作成功',
        data: res.data,
        success: true,
      };
    }
    return {
      msg: res.msg,
      data: null,
      success: false,
    };
  }

  /**
   * 上传新的头像
   */
  @action
  async updateAvatar(file) {
    if (!file) return;
    const param = new FormData();
    param.append('avatar', file); // 通过append向form对象添加数据
    param.append('pid', this.id);

    const updateAvatarRes = await updateAvatar({
      transformRequest: [
        function (data) {
          return data;
        },
      ],
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: param,
    });

    if (updateAvatarRes.code === 0) {
      this.userInfo.avatarUrl = updateAvatarRes.data.avatarUrl;
      this.userInfo = { ...this.userInfo };
      return updateAvatarRes.data;
    }

    throw {
      Code: updateAvatarRes.code,
      Msg: updateAvatarRes.msg,
    };
  }

  /**
   * 上传新的背景图
   */
  @action
  async updateBackground(file) {
    if (!file) return;
    const param = new FormData();
    param.append('background', file); // 通过append向form对象添加数据
    const updateBackgroundRes = await updateBackground({
      transformRequest: [
        function (data) {
          return data;
        },
      ],
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: param,
    });


    if (updateBackgroundRes.code === 0) {
      // 因为背景图 url 是一致的，所以会导致不更新，这里进行先赋予空值，再延时赋值
      setTimeout(() => {
        this.userInfo.backgroundUrl = updateBackgroundRes.data.backgroundUrl;
        this.userInfo = { ...this.userInfo };
      }, 500);
      return updateBackgroundRes.data;
    }

    throw {
      Code: updateBackgroundRes.code,
      Msg: updateBackgroundRes.msg,
    };
  }

  // FIXME: 这里报接口参数错误
  /**
   * 更新新的用户信息
   */
  @action
  async updateEditedUserInfo() {
    const updateUserInfoRes = await updateUsersUpdate({
      data: {
        signature: this.editSignature,
        nickname: this.editNickName,
      },
    });

    if (updateUserInfoRes.code === 0) {
      this.userInfo.signature = this.editSignature;
      // 用户名不能为空
      if (this.editNickName) {
        this.userInfo.nickname = this.editNickName;
      }
      return updateUserInfoRes.data;
    }

    throw {
      Code: updateUserInfoRes.code,
      Message: updateUserInfoRes.msg,
    };
  }

  @action
  async updateEditedUserNickname() {
    const updateUserInfoRes = await updateUsersUpdate({
      data: {
        nickname: this.editNickName,
      },
    });

    if (updateUserInfoRes.code === 0) {
      this.userInfo.nickname = this.editNickName;
      return updateUserInfoRes.data;
    }

    throw {
      Code: updateUserInfoRes.code,
      Message: updateUserInfoRes.msg,
    };
  }

  @action
  async updateEditedUserSignature() {
    const updateUserInfoRes = await updateUsersUpdate({
      data: {
        signature: this.editSignature,
      },
    });

    if (updateUserInfoRes.code === 0) {
      this.userInfo.signature = get(updateUserInfoRes, 'data.signature');
      return updateUserInfoRes.data;
    }

    throw {
      Code: updateUserInfoRes.code,
      Message: updateUserInfoRes.msg,
    };
  }

  /**
   * 初次设置用户密码
   */
  @action
  async setUserPassword() {
    const setUserPasswordRes = await updateUsersUpdate({
      data: {
        newPassword: this.newPassword,
        passwordConfirmation: this.newPasswordRepeat,
      },
    });

    if (setUserPasswordRes.code === 0) {
      return setUserPasswordRes.data;
    }

    throw {
      Code: setUserPasswordRes.code,
      Message: setUserPasswordRes.msg,
    };
  }

  @action
  async updateUsername() {
    const updateUserInfoRes = await updateUsersUpdate({
      data: {
        username: this.editUserName,
      },
    });

    if (updateUserInfoRes.code === 0) {
      this.userInfo.username = this.editUserName;
      return updateUserInfoRes.data;
    }

    throw {
      Code: updateUserInfoRes.code,
      Msg: updateUserInfoRes.msg,
    };
  }

  /**
   * 重设用户密码
   */
  @action
  async resetUserPassword() {
    const resetUserPasswordRes = await updateUsersUpdate({
      data: {
        password: this.oldPassword,
        newPassword: this.newPassword,
        passwordConfirmation: this.newPasswordRepeat,
      },
    });

    if (resetUserPasswordRes.code === 0) {
      return resetUserPasswordRes.data;
    }

    throw {
      Code: resetUserPasswordRes.code,
      Message: resetUserPasswordRes.msg,
    };
  }

  @action
  async sendSmsUpdateCode({ mobile, captchaTicket, captchaRandStr }) {
    const smsResp = await smsSend({
      data: {
        mobile,
        type: 'rebind',
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

  @action
  async sendSmsVerifyCode({ mobile, captchaTicket, captchaRandStr }) {
    const smsResp = await smsSend({
      data: {
        mobile,
        type: 'verify',
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

  @action
  async verifyOldMobile() {
    const smsVerifyRes = await smsVerify({
      data: {
        mobile: this.originalMobile,
        code: this.oldMobileVerifyCode,
      },
    });

    if (smsVerifyRes.code === 0) {
      return smsVerifyRes.data;
    }

    throw {
      Code: smsVerifyRes.code,
      Message: smsVerifyRes.msg,
    };
  }

  @action
  async rebindMobile() {
    const smsRebindRes = await smsRebind({
      data: {
        mobile: this.newMobile,
        code: this.newMobileVerifyCode,
      },
    });

    if (smsRebindRes.code === 0) {
      return smsRebindRes.data;
    }

    throw {
      Code: smsRebindRes.code,
      Message: smsRebindRes.msg,
    };
  }

  @action
  async getUserLikes(page = 1) {
    const userLikesList = await readThreadList({
      params: {
        page,
        filter: {
          complex: 2,
        },
      },
    });

    return userLikesList;
  }

  @action
  async getUserCollections(page = 1) {
    const userCollectionList = await readThreadList({
      params: {
        page,
        filter: {
          complex: 2,
        },
      },
    });

    return userCollectionList;
  }

  /**
   * 我的屏蔽对应store函数
   */

  // 获取屏蔽列表数据
  @action
  async getUserShieldList() {
    const userShieldList = await readUsersDeny({
      params: {
        page: this.userShieldPage, // 页码
      },
    });
    const pageData = get(userShieldList, 'data.pageData', []);
    const totalPage = get(userShieldList, 'data.totalPage', 1);
    this.userShieldTotalPage = totalPage;
    this.userShield = [...this.userShield, ...pageData];
    this.userShieldTotalCount = get(userShieldList, 'data.totalCount', 0);

    if (this.userShieldPage <= this.userShieldTotalPage) {
      this.userShieldPage += 1;
    }

    if (userShieldList.code !== 0) {
      throw {
        Code: userShieldList.code,
        Message: userShieldList.msg,
      };
    }
    return this.userShield;
  }

  /**
   * 重置帖子相关的数据
   */
  @action
  clearUserThreadsInfo() {
    this.userThreads = {};
    this.userThreadsPage = 1;
    this.userThreadsTotalCount = 0;
    this.userThreadsTotalPage = 1;
  }

  /**
   * 清理对应用户密码函数
   */
  @action
  clearUserAccountPassword = () => {
    this.oldPassword = null;
    this.newPassword = null;
    this.newPasswordRepeat = null;
  };

  /**
   * 四个清理函数，清理用户和目标用户粉丝信息
   */
  @action
  cleanUserFans = () => {
    this.userFans = {};
    this.userFansPage = 1;
    this.userFansTotalPage = 1;
  };

  @action
  cleanUserFollows = () => {
    this.userFollows = {};
    this.userFollowsPage = 1;
    this.userFollowsTotalPage = 1;
  };

  @action
  cleanTargetUserFans = () => {
    this.targetUserFans = {};
    this.targetUserFansPage = 1;
    this.targetUserFansTotalPage = 1;
  };

  @action
  cleanTargetUserFollows = () => {
    this.targetUserFollows = {};
    this.targetUserFollowsPage = 1;
    this.targetUserFollowsTotalPage = 1;
  };

  /**
   * 清理我的屏蔽数据内容
   */
  @action
  clearUserShield = () => {
    // 我的屏蔽 数据设计
    this.userShield = []; // 用户屏蔽列表
    // 触底加载条件 当加载的页数超过总页数的时候就没有更多了
    this.userShieldPage = 1; // 页码
    this.userShieldTotalPage = 1; // 总页数
    this.userShieldTotalCount = 0; // 总条数
  };

  // 生成微信换绑二维码，仅在 PC 使用
  @action
  genRebindQrCode = async ({ scanSuccess = () => {}, scanFail = () => {}, onTimeOut = () => {}, option = {} }) => {
    clearInterval(this.rebindTimer);
    this.isQrCodeValid = true;
    const qrCodeRes = await wechatRebindQrCodeGen(option);

    if (qrCodeRes.code === 0) {
      this.rebindQRCode = get(qrCodeRes, 'data.base64Img');
      const sessionToken = get(qrCodeRes, 'data.sessionToken');

      this.rebindTimer = setInterval(() => {
        this.wechatRebindStatusPoll({
          sessionToken,
          scanSuccess,
          scanFail,
        });
      }, 2000);

      // 5min，二维码失效
      setTimeout(() => {
        this.isQrCodeValid = false;
        clearInterval(this.rebindTimer);
        if (onTimeOut) {
          onTimeOut();
        }
      }, 4 * 60 * 1000);

      return qrCodeRes.data;
    }

    throw {
      Code: qrCodeRes.code,
      Msg: qrCodeRes.msg,
    };
  };

  // mini 换绑接口
  @action
  rebindWechatMini = async ({ jsCode, iv, encryptedData, sessionToken }) => {
    try {
      const miniRebindResp = await miniRebind({
        data: {
          jsCode,
          iv,
          encryptedData,
          sessionToken,
        },
      });

      if (miniRebindResp.code === 0) {
        return miniRebindResp;
      }

      // 不为零，实际是错误
      throw miniRebindResp;
    } catch (err) {
      if (err.code) {
        throw {
          Code: err.code,
          Msg: err.msg,
        };
      }

      throw {
        Code: 'rbd_9999',
        Msg: '网络错误',
        err,
      };
    }
  };

  // h5 换绑接口
  @action
  rebindWechatH5 = async ({ code, sessionId, sessionToken, state }) => {
    try {
      const h5RebindResp = await h5Rebind({
        params: {
          code,
          sessionId,
          sessionToken,
          state,
        },
      });

      if (h5RebindResp.code === 0) {
        return h5RebindResp;
      }

      // 不为零，实际是错误
      throw h5RebindResp;
    } catch (err) {
      if (err.code) {
        throw {
          Code: err.code,
          Msg: err.msg,
        };
      }

      throw {
        Code: 'rbd_9999',
        Msg: '网络错误',
        err,
      };
    }
  };

  // 轮询重新绑定结果
  @action
  wechatRebindStatusPoll = async ({ sessionToken, scanSuccess, scanFail }) => {
    const scanStatus = await getWechatRebindStatus({
      params: {
        sessionToken,
      },
    });

    if (scanStatus.code === 0) {
      if (scanSuccess) {
        scanSuccess();
      }
    }

    if (scanStatus.code !== 0) {
      if (scanStatus.msg !== '扫码中') {
        if (scanFail) {
          scanFail(scanStatus);
        }
      }
    }
  };

  // 获取用户注册扩展信息
  @action
  getUserSigninFields = async () => {
    let signinFieldsResp = {
      code: 0,
      data: [],
    };

    const safeParse = (value) => {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error(e);
        console.error('解析JSON错误', value);
        return value;
      }
    };

    try {
      signinFieldsResp = await getSignInFields();
    } catch (e) {
      console.error(e);
      throw {
        Code: 'usr_9999',
        Message: '网络错误',
      };
    }
    if (signinFieldsResp.code === 0) {
      this.userSigninFields = signinFieldsResp.data.map((item) => {
        if (!item.fieldsExt) {
          item.fieldsExt = '';
        } else {
          item.fieldsExt = safeParse(item.fieldsExt);
        }
        return item;
      });
    } else {
      throw {
        Code: signinFieldsResp.code,
        Message: signinFieldsResp.msg,
      };
    }
  };

  // 清空换绑二维码和interval
  @action
  clearWechatRebindTimer = () => {
    clearInterval(this.rebindTimer);
    this.rebindQRCode = null;
    this.isQrCodeValid = true;
  };
}

export default UserAction;
