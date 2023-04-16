import { observable, action } from 'mobx';
import { get } from '@common/utils/get';
import { groupPermissionList, getForum } from '../../server';

class ForumStore {
  constructor() {}
  @observable isPopup = false;
  @observable isNoMore = false;
  @observable usersPageData = null;
  @observable userPage = 1;
  @observable isLoading = true;
  @observable userTotal = 0;
  @observable threadsPageData = null;
  @observable threadTotal = 0;
  @observable updataTime = null;
  @observable myGroup = null;
  @observable myPermissons = null;
  @observable otherPermissions = null;
  @observable introduceVisible = false;

  @action
  setIntroduceVisible(visible) {
    this.introduceVisible = visible;
  }

  @action
  setUserPage(page) {
    this.userPage = page;
  }

  @action
  setIsPopup(is) {
    this.isPopup = is;
  }

  @action
  setIsLoading(is) {
    this.isLoading = is;
  }

  @action
  async setOtherPermissions(data) {
    try {
      if ( data ) {
        this.otherPermissions = get(data, 'other', {});
      } else {
        const res = await getForum();
        this.otherPermissions = get(res, 'data.other', {});
      }
     
    } catch (error) {
      console.log(error)
    }
  }

  @action
  async setGroupPermissionList() {
    try {
      const resp = await groupPermissionList();
      this.myGroup = get(resp, 'data.myGroup', {});
      this.myPermissons = get(resp, 'data.myPermissons', {});
    } catch (e) {
      console.log(e);
    }
  }

  @action
  setUsersPageData(res) {
    const data = get(res, 'pageData', []);
    const total = get(res, 'totalCount', 0);
    const totalPage = get(res, 'totalPage', 0);
    const currentPage = get(res, 'currentPage', 0);
    this.usersPageData = data;
    this.userTotal = total;
    this.userPage = currentPage;
    this.isNoMore = currentPage >= totalPage;
  }

  @action
  setThreadsPageData(res) {
    const data = get(res, 'pageData', []);
    const time = get(data[0], 'createdAt', null);
    const total = get(res, 'totalCount', 0);
    this.threadsPageData = data;
    this.threadTotal = total;
    this.updataTime = time;
  }
}

export default ForumStore;
