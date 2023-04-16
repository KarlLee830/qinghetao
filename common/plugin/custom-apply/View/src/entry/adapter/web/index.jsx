import React from 'react';
import { Icon, Dialog, Button, Input, Textarea, Radio, Toast, Checkbox } from '@discuzqsdk/design';
// 移动端时间选择
import DatePickers from '@components/thread/date-picker';
// pc 端时间选择
import DatePicker, { registerLocale } from 'react-datepicker';
import { zhCN } from 'date-fns/locale';
import { getHours, setHours, getMinutes, setMinutes, format } from 'date-fns';
import classNames from 'classnames';
import { formatDate } from '@common/utils/format-date';
import { getPostData, formatPostData, ATTACH_INFO_TYPE } from '@common/plugin/custom-apply/View/src/common';
import { ONE_DAY } from '@common/constants/thread-post';
import styles from '../index.module.scss';
registerLocale('zh-CN', zhCN);

const TimeType = {
  actStart: 'activityStartTime',
  actEnd: 'activityEndTime',
  applyStart: 'registerStartTime',
  applyEnd: 'registerEndTime',
};

export default class CustomApplyEntry extends React.Component {
  constructor(props) {
    super(props);

    const nowTime = new Date();
    const time = nowTime.getTime() + ONE_DAY;
    this.state = {
      visible: false,
      showMore: false,
      showMobileDatePicker: false,
      body: {
        activityStartTime: nowTime, // 活动开始时间
        activityEndTime: time, // 活动结束时间
        title: '', // 活动名称
        content: '', // 活动详情
        registerStartTime: '', // 报名开始时间
        registerEndTime: '', // 报名结束时间
        actPlace: '', // 活动地点
        actPeopleLimitType: 0, // 0 不限制；1 限制
        totalNumber: '',
        additionalInfoType: [], // 报名选项
      },
      curClickTime: TimeType.actStart,
      minTime: setHours(setMinutes(new Date(), getMinutes(nowTime)), getHours(nowTime)),
      maxTime: setHours(setMinutes(new Date(), 30), 23),
    };
  }

  // update
  componentDidUpdate(prevProps, prevState) {
    const { renderData } = this.props;
    // 弹框弹起时，准备同步state和renderData
    if ((this.state.visible && !renderData?.isShow && prevState.visible !== this.state.visible)
      || (renderData?.isShow && prevProps?.renderData?.isShow !== renderData.isShow)
    ) {
      if (renderData?.body?.activityStartTime) {
        this.setState({ body: formatPostData(renderData.body), visible: true }, () => {
          const { activityStartTime, activityEndTime } = renderData.body;
          this.getMinTime(activityStartTime);
          this.getMaxTime(activityEndTime);
        });
      }
    }
  }

  handleTimeChange = (date, type) => {
    const { body } = this.state;
    const time = date;
    switch (type) {
      case TimeType.actStart:
        this.setState({ body: { ...body, activityStartTime: time } }, () => {
          this.getMinTime(date);
        });
        break;
      case TimeType.actEnd:
        if (this.checkActEndTime(time)) {
          this.setState({ body: { ...body, activityEndTime: time } }, () => {
            this.getMaxTime(date);
          });
        }
        break;
      case TimeType.applyStart:
        if (this.checkApplyStartTime(time)) {
          this.setState({ body: { ...body, registerStartTime: time } });
        }
        break;
      case TimeType.applyEnd:
        if (new Date(date) % 3600 === 0) {
          this.getMinTime(date);
          this.getMaxTime(date);
        }
        if (this.checkApplyEndTime(time)) {
          this.setState({ body: { ...body, registerEndTime: time } });
        }
        break;
      default:
        break;
    }
  };

  /**
   * 报名结束时间早于活动结束时间置灰
   */
  getMinTime = (date) => {
    const { siteData } = this.props;
    if (!siteData.isPC) return;

    const { body } = this.state;
    const { activityStartTime, activityEndTime } = body;
    const start = format(activityStartTime, 'yyyy/MM/dd');
    const end = format(new Date(activityEndTime), 'yyyy/MM/dd');
    const applyEnd = format(new Date(date), 'yyyy/MM/dd');

    if (new Date(start).getTime() === new Date(applyEnd).getTime()
      && new Date(end).getTime() - new Date(start).getTime() >= 24 * 3600) {
      this.setState({
        minTime: setHours(setMinutes(activityStartTime, getMinutes(activityStartTime)), getHours(activityStartTime)),
        maxTime: setHours(setMinutes(activityStartTime, 30), 23),
      });
    }

    if (new Date(end).getTime() === new Date(start).getTime()) {
      this.setState({
        minTime: setHours(setMinutes(activityStartTime, getMinutes(activityStartTime)), getHours(activityStartTime)),
        maxTime: setHours(setMinutes(activityEndTime, getMinutes(activityEndTime)), getHours(activityEndTime)),
      });
    }
  };

  /**
   * 报名结束时间晚于活动结束时间置灰
   */
  getMaxTime = (date) => {
    const { siteData } = this.props;
    if (!siteData.isPC) return;

    const { body } = this.state;
    const { activityEndTime, activityStartTime } = body;
    const start = format(activityStartTime, 'yyyy/MM/dd');
    const end = format(activityEndTime, 'yyyy/MM/dd');
    const applyEnd = format(new Date(date), 'yyyy/MM/dd');

    if (new Date(end).getTime() === new Date(applyEnd).getTime()
      && new Date(end).getTime() - new Date(start).getTime() >= 24 * 3600) {
      this.setState({
        minTime: setHours(setMinutes(activityEndTime, 0), 0),
        maxTime: setHours(setMinutes(activityEndTime, getMinutes(activityEndTime)), getHours(activityEndTime)),
      });
    }

    if (new Date(end).getTime() === new Date(start).getTime()) {
      this.setState({
        minTime: setHours(setMinutes(activityStartTime, getMinutes(activityStartTime)), getHours(activityStartTime)),
        maxTime: setHours(setMinutes(activityEndTime, getMinutes(activityEndTime)), getHours(activityEndTime)),
      });
    }
  };

  getTimestamp = time => new Date(time).getTime();

  checkActEndTime = (time) => {
    const { activityStartTime } = this.state.body || {};
    if (this.getTimestamp(time) <= this.getTimestamp(activityStartTime)) {
      Toast.info({ content: '活动结束时间必须大于活动开始时间' });
      return false;
    }
    return true;
  };

  checkApplyStartTime = (time) => {
    const { activityEndTime } = this.state.body || {};
    if (this.getTimestamp(time) >= this.getTimestamp(activityEndTime)) {
      Toast.info({ content: '报名开始时间必须小于活动结束时间' });
      return false;
    }
    return true;
  };

  checkApplyEndTime = (time) => {
    const { registerStartTime, activityEndTime } = this.state.body || {};
    if (this.getTimestamp(time) <= this.getTimestamp(registerStartTime)) {
      Toast.info({ content: '报名结束时间必须大于报名开始时间' });
      return false;
    }
    if (this.getTimestamp(time) > this.getTimestamp(activityEndTime)) {
      Toast.info({ content: '报名结束时间不能大于活动结束时间' });
      return false;
    }
    return true;
  };

  handleTitleChange = (e) => {
    const { body } = this.state;
    this.setState({ body: { ...body, title: e.target.value } });
  };

  handleContentChange = (e) => {
    const { body } = this.state;
    this.setState({ body: { ...body, content: e.target.value } });
  }

  handlePlaceChange = (e) => {
    const { body } = this.state;
    this.setState({ body: { ...body, actPlace: e.target.value } });
  }

  handleDialogOpen = () => {
    this.setState({ visible: true });
  };

  handleDialogClose = () => {
    this.setState({ visible: false });
    const { renderData, _pluginInfo } = this.props;
    if (!renderData?.isShow) return;
    this.props.onConfirm({ postData: renderData, _pluginInfo });
  };

  handleMoreClick = () => {
    this.setState({ showMore: !this.state.showMore });
  };

  handleDialogConfirm = () => {
    const { body } = this.state;
    const { activityStartTime, activityEndTime, registerStartTime, registerEndTime } = body;
    if (!this.checkActEndTime(activityEndTime)) return false;
    if (!this.checkApplyStartTime(registerStartTime)) return false;
    if (!this.checkApplyEndTime(registerEndTime)) return false;

    const { renderData, _pluginInfo } = this.props;
    const postData = getPostData(body, _pluginInfo.options.tomId) || {};
    if (renderData?.body?.activityId) postData.body.activityId = renderData?.body?.activityId;
    this.props.onConfirm({ postData, _pluginInfo });
    this.setState({ visible: false });
  };

  handleLimitChange = (val) => {
    const { body } = this.state;
    this.setState({ body: { ...body, actPeopleLimitType: val } });
  };

  handleLimitPeopleChange = (e) => {
    const val = Math.floor(e.target.value);
    if (val > 10000) {
      Toast.info({ content: '报名人数不能大于10000'} );
      return;
    }
    const { body } = this.state;
    this.setState({ body: { ...body, totalNumber: val || "" } });
  };

  handleTimeClick = (curClickTime) => {
    const { siteData } = this.props;
    const isPc = siteData.platform !== 'h5';
    if (isPc) return;
    this.setState({ showMobileDatePicker: true, curClickTime });
  };

  handleMobileTimeChange = (time) => {
    const { curClickTime } = this.state;
    this.handleTimeChange(new Date(time), curClickTime);
    this.setState({ showMobileDatePicker: false });
  };

  getMobileCurClickTime = () => {
    const { curClickTime, body } = this.state;
    const time = body[curClickTime];
    if (body[curClickTime]) return new Date(time);
    return new Date();
  };

  /**
   * 插件入口是否显示判断
   */
  isShowApplyIcon = () => {
    const { siteData, _pluginInfo } = this.props;
    const { pluginConfig } = siteData;
    if (!pluginConfig) return false;
    const [act] = (pluginConfig || []).filter(item => item.app_id === _pluginInfo.options.tomId);
    if (act?.authority?.canUsePlugin) return true;
    return false;
  };

  handleCheckAll = (val) => {
    const additionalInfoType = val ? Object.values(ATTACH_INFO_TYPE) : [];
    this.setState({ body: { ...this.state.body, additionalInfoType } });
  };

  handleCheck = (list) => {
    this.setState({ body: { ...this.state.body, additionalInfoType: list } });
  };

  render() {
    const { siteData } = this.props;
    const isPc = siteData.isPC;
    const platformCls = isPc ? styles.pc : styles.h5;
    const { visible, showMore, body, showMobileDatePicker, minTime, maxTime } = this.state;
    const moreClass = !showMore
      ? classNames(styles['dzqp-act--more'], styles.fold) : classNames(styles['dzqp-act--more'], styles.expand);

    if (!this.isShowApplyIcon()) return null;

    return (
      <>
        <Icon
          onClick={this.handleDialogOpen}
          name="ApplyOutlined"
          size="20"
        />
        <Dialog
          visible={visible}
          maskClosable={false}
          onCancel={this.handleDialogClose}
          onClose={this.handleDialogClose}
          onConfirm={this.handleDialogConfirm}
          isNew={true}
          type="confirm"
          title="创建活动报名"
          className={classNames(styles['dzqp-act'], platformCls)}
        >
          <div className={styles['dzqp-act--item']}>
            <div className={styles['dzqp-act--item_title']}>开始时间</div>
            <div className={styles['dzqp-act--item_right']} onClick={() => this.handleTimeClick(TimeType.actStart)}>
              {isPc
                ? <DatePicker
                    locale="zh-CN"
                    selected={body.activityStartTime}
                    minDate={new Date()}
                    onChange={date => this.handleTimeChange(date, TimeType.actStart)}
                    showTimeSelect
                    dateFormat="yyyy/MM/dd HH:mm:ss"
                  />
                : <span>{formatDate(body.activityStartTime, 'yyyy/MM/dd hh:mm:ss')}</span>
              }
              <Icon name="RightOutlined" size="8" />
            </div>
          </div>
          <div className={styles['dzqp-act--item']}>
            <div className={styles['dzqp-act--item_title']}>结束时间</div>
            <div className={styles['dzqp-act--item_right']} onClick={() => this.handleTimeClick(TimeType.actEnd)}>
              {isPc
                ? <DatePicker
                    locale="zh-CN"
                    selected={body.activityEndTime}
                    minDate={body.activityStartTime}
                    onChange={date => this.handleTimeChange(date, TimeType.actEnd)}
                    showTimeSelect
                    dateFormat="yyyy/MM/dd HH:mm:ss"
                  />
                : <span>{formatDate(body.activityEndTime, 'yyyy/MM/dd hh:mm:ss')}</span>
              }
              <Icon name="RightOutlined" size="8" />
            </div>
          </div>
          <div className={moreClass} onClick={this.handleMoreClick}>
            <span>高级设置</span>
            <Icon name="RightOutlined" size="8" />
          </div>
          {showMore && (
            <>
              <div className={classNames(styles['dzqp-act--item'], styles['act-name'])}>
                <div className={styles['dzqp-act--item_title']}>活动名称</div>
                <Input
                  className={styles['dzqp-act--item_right']}
                  htmlType="text"
                  mode="text"
                  placeholder="最多支持50个字符"
                  maxLength={50}
                  value={body.title}
                  onChange={this.handleTitleChange}
                />
              </div>
              <div className={classNames(styles['dzqp-act--item'], styles['act-detail'])}>
                <div className={classNames(styles['dzqp-act--item_title'], styles['width-auto'])}>
                  活动详情 <span>最多支持200个字符</span>
                </div>
                <Textarea
                  className={styles['dzqp-act--item_right']}
                  placeholder="请输入活动介绍"
                  rows={4}
                  maxLength={200}
                  value={body.content}
                  onChange={this.handleContentChange}
                />
              </div>
              <div className={styles['dzqp-act--item']}>
                <div className={styles['dzqp-act--item_title']}>报名开始</div>
                <div className={styles['dzqp-act--item_right']} onClick={() => this.handleTimeClick(TimeType.applyStart)}>
                  {isPc
                    ? <DatePicker
                        locale="zh-CN"
                        selected={body.registerStartTime}
                        maxDate={body.activityEndTime}
                        onChange={date => this.handleTimeChange(date, TimeType.applyStart)}
                        showTimeSelect
                        dateFormat="yyyy/MM/dd HH:mm:ss"
                      />
                    : <span>{body.registerStartTime && formatDate(body.registerStartTime, 'yyyy/MM/dd hh:mm:ss')}</span>
                  }
                  <Icon name="RightOutlined" size="8" />
                </div>
              </div>
              <div className={styles['dzqp-act--item']}>
                <div className={styles['dzqp-act--item_title']}>报名结束</div>
                <div className={styles['dzqp-act--item_right']} onClick={() => this.handleTimeClick(TimeType.applyEnd)}>
                  {isPc
                    ? <DatePicker
                        locale="zh-CN"
                        selected={body.registerEndTime}
                        minDate={body.registerStartTime || body.activityStartTime}
                        maxDate={body.activityEndTime}
                        // minTime={minTime}
                        // maxTime={maxTime}
                        onChange={date => this.handleTimeChange(date, TimeType.applyEnd)}
                        showTimeSelect
                        dateFormat="yyyy/MM/dd HH:mm:ss"
                      />
                    : <span>{body.registerEndTime && formatDate(body.registerEndTime, 'yyyy/MM/dd hh:mm:ss')}</span>
                  }
                  <Icon name="RightOutlined" size="8" />
                </div>
              </div>
              <div className={styles['dzqp-act--item']}>
                <div className={styles['dzqp-act--item_title']}>活动地点</div>
                <div className={styles['dzqp-act--item_right']}>
                  <Input
                    className={styles['dzqp-act--item_right']}
                    htmlType="text"
                    mode="text"
                    placeholder="请输入活动地点"
                    maxLength={50}
                    value={body.actPlace}
                    onChange={this.handlePlaceChange}
                  />
                </div>
              </div>
              <div className={styles['dzqp-act--item']}>
                <div className={styles['dzqp-act--item_title']}>人数限制</div>
                <div className={styles['dzqp-act--item_right']}>
                  <Radio.Group
                    onChange={this.handleLimitChange}
                    value={body.actPeopleLimitType}
                  >
                    <Radio name={0}>不限制</Radio>
                    <Radio name={1}>
                      限<Input htmlType="number" mode="number"
                        disabled={body.actPeopleLimitType === 0}
                        value={body.totalNumber}
                        onChange={this.handleLimitPeopleChange}
                        className={styles['dzqp-act__limit_input']}
                      />人报名
                    </Radio>
                  </Radio.Group>
                </div>
              </div>
              <div className={classNames(styles['dzqp-act--item'], styles.options)}>
                <div className={styles.flex}>
                  <div className={styles['dzqp-act--item_title']}>报名必填</div>
                  <div className={styles['dzqp-act--item_right']}>
                    <Checkbox
                      checked={body.additionalInfoType?.length === 4} onChange={this.handleCheckAll}>全选</Checkbox>
                  </div>
                </div>
                <Checkbox.Group
                  onChange={this.handleCheck}
                  value={body.additionalInfoType}
                  className={styles['apply-options']}
                >
                  <Checkbox name={ATTACH_INFO_TYPE.name}>姓名</Checkbox>
                  <Checkbox name={ATTACH_INFO_TYPE.mobile}>手机号</Checkbox>
                  <Checkbox name={ATTACH_INFO_TYPE.weixin}>微信号</Checkbox>
                  <Checkbox name={ATTACH_INFO_TYPE.address}>地址</Checkbox>
                </Checkbox.Group>
              </div>
            </>
          )}
          <DatePickers
            onSelects={this.handleMobileTimeChange}
            time={this.getMobileCurClickTime()}
            isOpen={showMobileDatePicker}
            onCancels={() => this.setState({ showMobileDatePicker: false })}
          />
        </Dialog>
      </>
    );
  }
}
