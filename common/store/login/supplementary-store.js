import { observable, action } from 'mobx';

export const SUPPLEMENTARY_STORE_ERRORS = {
  NO_NAME_ERROR: {
    Code: 'sm_0000',
    Message: '请填写姓名',
  },
  NO_CAUSE_ERROR: {
    Code: 'sm_0001',
    Message: '请填写注册原因',
  },
  NO_GENDER_ERROR: {
    Code: 'sm_0002',
    Message: '请填写性别',
  },
  NO_INTEREST_ERROR: {
    Code: 'sm_0003',
    Message: '请填写爱好',
  },
  NO_PHOTO_ERROR: {
    Code: 'sm_0004',
    Message: '请填写照片',
  },
  NO_ATTACHMENT_ERROR: {
    Code: 'sm_0005',
    Message: '请填写附件',
  },
  NETWORK_ERROR: {
    Code: 'sm_9999',
    Message: '网络错误',
  },
};

export default class supplementaryStore {
    codeTimmer = null;

    // 姓名
    @observable name = '';
    // 原因
    @observable cause = '';
    // 性别
    @observable gender = '';
    // 爱好
    @observable interest = [];
    // 照片
    @observable photo = '';
    // 附件
    @observable attachment = '';

    @observable fields = [];
    @observable values = [];
}
