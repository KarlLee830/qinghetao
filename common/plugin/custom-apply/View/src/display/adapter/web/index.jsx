import React from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Icon, Avatar, Toast, Dialog, Input } from '@discuzqsdk/design';
import PopupList from '@components/thread/popup-list';
import CountDown from '@common/utils/count-down';
import LoginHelper from '@common/utils/login-helper';
import { ATTACH_INFO_TYPE, ATTACH_INFO_NAME } from '@common/plugin/custom-apply/View/src/common';
import classNames from 'classnames';
import styles from '../index.module.scss';
import actEntryStyles from '../../../entry/adapter/index.module.scss';

let countDownIns = null;

class CustomApplyDisplay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isDetailPage: props.dzqRouter.router.router.pathname === '/thread/[id]',
      popupShow: false,
      loading: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isApplyEnd: false, // 报名时间是否已结束
      isApplyStart: false, // 报名时间是否已开始
      isAttachShow: false, // 是否显示报名字段
      additionalInfo: {}, // 报名字段详细信息
    };
    this.handleActOperate = this.handleActOperate.bind(this);
    this.createRegister = this.createRegister.bind(this);
    this.deleteRegister = this.deleteRegister.bind(this);
  }

  componentDidMount() {
    if (!countDownIns) countDownIns = new CountDown();
    this.initCountDown();
  }

  componentDidUpdate(prevProps, prevState) {
    // fix: 付费报名帖付费后需要再次执行初始化倒计时
    if (prevProps.renderData === null && this.props.renderData !== null) {
      this.initCountDown();
    }

  }
  componentWillUnmount() {
    if (!countDownIns) countDownIns?.stop();
  }

  initCountDown() {
    const { renderData } = this.props;
    const { body } = renderData || {};
    if (body?.registerEndTime || body?.registerStartTime) {
      const start = body?.registerStartTime?.replace(/-/g, '/');
      const time = body?.registerEndTime?.replace(/-/g, '/');

      if (new Date().getTime() < new Date(start).getTime()) {
        countDownIns.start(start, (res) => {
          const { days, hours, minutes, seconds } = res;
          this.setState({ minutes, seconds, days, hours });
          if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
            this.setState({ isApplyStart: true });
            this.applyStartCountDown(time);
          }
        });
      } else {
        this.setState({ isApplyStart: true });
        this.applyStartCountDown(time);
      }
    }
  }

  // 取消报名
  async deleteRegister(opt) {
    try {
      const { params = {}, data = {}, ...others } = opt;
      const options = {
        url: '/plugin/activity/api/register/cancel', // 请求地址
        method: 'POST',
        params,
        data,
        ...others,
      };
      const result = await this.props.dzqRequest.dispatcher(options);
      return result;
    } catch (error) {
      return this.props.dzqRequestHandleError(error);
    }
  }
  // 确认报名
  async createRegister(opt) {
    try {
      const { params = {}, data = {}, ...others } = opt;
      const options = {
        url: '/plugin/activity/api/register/append', // 请求地址
        method: 'POST',
        params,
        data,
        ...others,
      };
      const result = await this.props.dzqRequest.dispatcher(options);
      return result;
    } catch (error) {
      return this.props.dzqRequestHandleError(error);
    }
  }

  async exportInfo() {
    try {
      const { renderData, siteData } = this.props;
      const { body } = renderData || {};
      const { activityId } = body;
      Toast.info({ content: '导出中...' });
      window.open(`${siteData?.envConfig?.COMMON_BASE_URL}/plugin/activity/api/register/export?activityId=${activityId}`);
    } catch (error) {
      return this.props.dzqRequestHandleError(error);
    }
  }

  applyStartCountDown = (time) => {
    countDownIns.start(time, (res) => {
      const { days, hours, minutes, seconds } = res;
      // const ms = (days * 24 * 60) + (hours * 60) + minutes;
      this.setState({ minutes, seconds, days, hours });
      if (days === 0 && hours === 0 && minutes === 0 && seconds === 0) {
        this.setState({ isApplyEnd: true });
        countDownIns?.stop();
      }
    });
  };

  getUserCls = (users = []) => {
    if (users.length >= 3) return styles.three;
    if (users.length === 2) return styles.two;
    if (users.length === 1) return styles.one;
  };

  getActStatusText = () => {
    const { body } = this.props.renderData || {};
    const { isApplyEnd, isApplyStart } = this.state;
    if (!isApplyStart) return '报名未开始';
    if (body?.isMemberFull) return '人数已满';
    if (isApplyEnd) return '报名已结束';
  };

  submit = async () => {
    const { renderData, userInfo, threadData,
      updateThread, updateListThreadIndexes, recomputeRowHeights } = this.props;
    const { tomId, body, _plugin } = renderData || {};
    const { isRegistered, activityId, registerUsers, totalNumber } = body;
    const action = isRegistered ? this.deleteRegister : this.createRegister;
    this.setState({ loading: true, isAttachShow: false });
    const params = { activityId };
    if (Object.keys(this.state.additionalInfo)) params.additionalInfo = this.state.additionalInfo;
    const res = await action({ data: params });
    this.setState({ loading: false });

    if (res.code === 0) {
      const authorInfo = userInfo;
      const uid = authorInfo.id;
      const users = registerUsers.filter(item => item.userId !== uid);
      let currentNumber = body?.currentNumber;
      // 没有报名
      if (!isRegistered) {
        users.unshift({
          userId: uid,
          avatar: authorInfo.avatarUrl,
          nickname: authorInfo.nickname,
        });
        currentNumber = body?.currentNumber + 1;
      } else {
        currentNumber = body?.currentNumber - 1;
      }
      const tid = this.state.isDetailPage ? threadData?.id : threadData?.threadId;
      const tomValue = {
        body: {
          ...body,
          isRegistered: !isRegistered,
          registerUsers: users,
          currentNumber,
          isMemberFull: currentNumber === totalNumber && totalNumber > 0,
        },
        tomId,
        threadId: tid,
        _plugin,
      };
      updateThread(tomId, tomValue);
      const newThreadData = updateListThreadIndexes(tid, tomId, tomValue);
      if (newThreadData && recomputeRowHeights) recomputeRowHeights(newThreadData);
      Toast.info({ content: isRegistered ? '取消报名成功' : '报名成功' });
    } else Toast.error({ content: res.msg || '报名失败' });
    return res;
  };

  handleActOperate = async () => {
    const { renderData, isLogin } = this.props;
    if (!isLogin()) {
      LoginHelper.saveAndLogin();
      return;
    }
    const { body } = renderData || {};
    const { isRegistered, additionalInfoType = [] } = body;
    // 报名 + 并且有额外需要添加的字段
    if (!this.state.isAttachShow && !isRegistered && additionalInfoType && additionalInfoType.length) {
      this.setState({ isAttachShow: true });
      return;
    }

    const res = await this.submit();
    return res;
  };

  handleMoreClick = () => {
    const { dzqRouter, threadData } = this.props;
    const tid = this.state.isDetailPage ? threadData?.id : threadData?.threadId;
    if (tid) {
      dzqRouter.push({ url: `/thread/${tid}` });
    }
  };

  handleAttachClose = () => this.setState({ isAttachShow: false });

  handleAttachInfoChange = (e, item) => {
    const { key } = ATTACH_INFO_NAME[item?.toString()] || {};
    if (!key) return;
    const { additionalInfo } = this.state;
    let val = e.target.value;
    if (item === ATTACH_INFO_TYPE.mobile) {
      val = val.match(/\d{0,11}/g)[0] || "";
    }
    additionalInfo[key] = val;
    this.setState({ additionalInfo });
  };

  handleAttachConfirm = () => {
    const { body } = this.props.renderData || {};
    const { additionalInfo = {} } = this.state;
    const { additionalInfoType } = body || {};
    const len = (additionalInfoType || [])?.length;
    let flag = false;
    for (let i = 0; i < len; i++) {
      const key = additionalInfoType[i];
      if (!additionalInfo[ATTACH_INFO_NAME[key]?.key]) {
        flag = true;
        Toast.info({ content: `请输入${ATTACH_INFO_NAME[key]?.value}` });
        break;
      }
    }
    if (!flag) this.handleActOperate();
  };

  render() {
    const { siteData, renderData } = this.props;
    const { isApplyEnd, minutes, seconds, days, hours, isApplyStart, additionalInfo } = this.state;
    if (!renderData) return null;
    const { body } = renderData || {};
    const { isRegistered, additionalInfoType } = body || {};
    // 过期 || 已满 || 结束 || 未开始
    const isCanNotApply = body?.isExpired || body?.isMemberFull || isApplyEnd || !isApplyStart;
    const { popupShow } = this.state;
    const platform = siteData.platform === 'h5' ? styles.h5 : styles.pc;

    return (
      <>
        <div className={classNames(styles.wrapper, platform)}>
          <div className={styles['wrapper-header']}>
            <div className={styles['wrapper-header__left']}>
              {body?.title && body?.title}
            </div>
            <div className={styles['wrapper-header__right']}>
              {!isApplyEnd && (
                <>
                  还有
                  <span className={styles['text-primary']}>{days}</span>天
                  <span className={styles['text-primary']}>{hours}</span>小时
                  <span className={styles['text-primary']}>{minutes}</span>分
                  <span className={styles['text-primary']}>{seconds}</span>秒
                  {isApplyStart ? '结束报名' : '开始报名'}
                </>
              )}
              {isApplyEnd && (
                <>
                  报名已结束
                </>
              )}
            </div>
          </div>
          <div className={styles['wrapper-content']}>
            {body?.content && (
              <>
                <div className={
                  classNames(styles['wrapper-content__detail'], {
                    [styles['text-clamp']]: !this.state.isDetailPage,
                  })
                }>
                  {body?.content}
                </div>
                {!this.state.isDetailPage && (
                  <div
                    className={classNames(styles['text-primary'], styles.more)}
                    onClick={this.handleMoreClick}
                  >查看详情></div>
                )}
              </>
            )}
            <div className={classNames(styles['wrapper-content__tip'], styles.mt4n)}>
              <Icon name="TimeOutlined" size="12" />
              <div className={styles['wrapper-tip__content']}>
                <span className={styles['wrapper-tip_title']}>活动时间</span>
                <span className={styles['wrapper-tip_detail']}>
                  {body?.activityStartTime} ~ {body?.activityEndTime}
                </span>
              </div>
            </div>
            {body?.position?.location && (<div className={styles['wrapper-content__tip']}>
              <Icon name="PositionOutlined" size="12" />
              <div className={styles['wrapper-tip__content']}>
                <span className={styles['wrapper-tip_title']}>活动地址</span>
                <span className={styles['wrapper-tip_detail']}>{body?.position?.location}</span>
              </div>
            </div>)}
            {body?.totalNumber !== 0 && (
              <div className={styles['wrapper-content__limit']}>
                限<span className={styles['text-primary']}>{body?.totalNumber}</span>人参与
              </div>
            )}
          </div>
          <div className={styles['wrapper-footer']}>
            <div className={styles['wrapper-footer__top']}>
              <div
                className={classNames(styles.users, this.getUserCls(body?.registerUsers || []))}
                onClick={() => this.setState({ popupShow: true })}
              >
                {(body?.registerUsers || []).map((item, index) => {
                  if (index <= 2) return <Avatar circle={true} size="small" text={item.nickname} image={item.avatar} key={item.nickname} />;
                  return null;
                })}
                <span className={styles.m10}>{body?.currentNumber}人已报名</span>
              </div>
              {(!isCanNotApply || isRegistered) && (
                <Button
                  type="primary"
                  loading={this.state.loading}
                  className={classNames(styles.applybtn, {
                    [styles.isregisterd]: isRegistered,
                  })}
                  onClick={this.handleActOperate}
                >
                  {isRegistered ? '取消报名' : '立即报名'}
                </Button>
              )}
            </div>
            {isCanNotApply && <Button full disabled className={styles.donebtn}>{this.getActStatusText()}</Button>}
          </div>
        </div>
        {popupShow && <PopupList
          isCustom
          activityId={body?.activityId}
          visible={popupShow}
          onHidden={() => this.setState({ popupShow: false })}
          tipData={{ platform: siteData.platform }}
          exportFn={this.exportInfo.bind(this)}
        />}
        {this.state.isAttachShow && (
          <Dialog
            title="填写信息"
            visible={this.state.isAttachShow}
            onCancel={this.handleAttachClose}
            onClose={this.handleAttachClose}
            onConfirm={this.handleAttachConfirm}
            isNew={true}
            type='confirm'
            className={classNames(actEntryStyles['dzqp-act'],
              siteData.platform === 'h5' ? actEntryStyles.h5 : actEntryStyles.pc)}
          >
            {(additionalInfoType || []).map(item => (<div className={actEntryStyles['dzqp-act--item']}>
              <div className={actEntryStyles['dzqp-act--item_title']} key={item}>
                {ATTACH_INFO_NAME[item?.toString()]?.value}
              </div>
              <div className={actEntryStyles['dzqp-act--item_right']}>
                <Input
                  className={actEntryStyles['dzqp-act--item_right']}
                  htmlType={item === ATTACH_INFO_TYPE.mobile ? 'number' : 'text'}
                  mode={item === ATTACH_INFO_TYPE.mobile ? 'number' : 'text'}
                  placeholder={`请输入${ATTACH_INFO_NAME[item?.toString()]?.value}`}
                  maxLength={50}
                  value={additionalInfo[ATTACH_INFO_NAME[item?.toString()]?.key] || ''}
                  onChange={e => this.handleAttachInfoChange(e, item)}
                />
              </div>
            </div>))}
          </Dialog>
        )}
      </>
    );
  }
};

export default CustomApplyDisplay;
