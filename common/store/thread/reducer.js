export default {
    /**
   * 创建点赞打赏用户数据 全局使用
   * @param {object} currentUser 
   * @param {number} type 
   * @returns object
   */
   createUpdateLikeUsersData(currentUser, type = 1) {
    return {
      avatar: currentUser.avatarUrl,
      userId: currentUser.id,
      userName: currentUser.nickname,
      type,
      createdAt: Date.now(),
      nickname: currentUser?.nickname || '',
    }
  },

  /**
   * 对点赞或取消点赞重组对应数据 全局使用
   * @param {object} likeReward 
   * @param {boolean} isLiked 
   * @param {object} userInfo 
   * @returns array
   */
  setThreadDetailLikedUsers(likeReward = null, isLiked, userInfo) {
    if (!likeReward) return null;
    const {users = []} = likeReward;
    let newUsers = [];
    if (isLiked) {
      newUsers = [userInfo, ...users];
    } else {

      users.reduce((result, item) => {
        if (item.userId !== userInfo.userId || (item.userId  === userInfo.userId && item.type !== 1)) {
          result.push(item);
        }
        return result;
      }, newUsers);
    }
    return newUsers
  }
}