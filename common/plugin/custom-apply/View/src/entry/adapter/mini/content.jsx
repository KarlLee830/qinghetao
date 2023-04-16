import React from 'react';
import { View, Text } from '@tarojs/components';
import { Icon, Dialog, Button, Input, Textarea, Radio, Toast, Checkbox } from '@discuzqsdk/design';
import DatePickers from '@components/thread-post/date-time-picker';
import classNames from 'classnames';
import { formatDate } from '@common/utils/format-date';
import { formatPostData, ATTACH_INFO_TYPE } from '@common/plugin/custom-apply/View/src/common';
import { debounce } from '@common/utils/throttle-debounce';
import { ONE_DAY } from '@common/constants/thread-post';
import styles from '../index.module.scss';

const TimeType = {
  actStart: 'activityStartTime',
  actEnd: 'activityEndTime',
  applyStart: 'registerStartTime',
  applyEnd: 'registerEndTime',
};
export default class CustomApplyEntryContent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showMore: false,
      showMobileDatePicker: false,
      body: {
        activityStartTime: new Date(), // 活动开始时间
        activityEndTime: new Date().getTime() + ONE_DAY, // 活动结束时间
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
      forceUpdate: true,
    };

    this.timeRef = React.createRef();
  }

  componentDidMount() {
    if (this.props.renderData) {
      const body = formatPostData(this.props?.renderData?.body);
      this.setState({ body });
      this.props.onChange(body);
    } else  this.props.onChange(this.state.body);
  }

  componentDidUpdate(prevProps) {
    if ((this.props?.renderData?.body?.activityStartTime !== prevProps?.renderData?.body?.activityStartTime)
      && this.props?.renderData?.body.activityStartTime) {
      this.setState({ body: formatPostData(this.props?.renderData?.body) });
    }
  }

  handleTimeChange = (date, type) => {
    const { body } = this.state;
    const time = date;
    switch (type) {
      case TimeType.actStart:
        this.setState({ body: { ...body, activityStartTime: time } }, () => {
          this.props.onChange(this.state.body);
        });
        break;
      case TimeType.actEnd:
        if (this.checkActEndTime(time)) {
          this.setState({ body: { ...body, activityEndTime: time } }, () => {
            this.props.onChange(this.state.body);
          });
        }
        break;
      case TimeType.applyStart:
        if (this.checkApplyStartTime(time)) {
          this.setState({ body: { ...body, registerStartTime: time } }, () => {
            this.props.onChange(this.state.body);
          });
        }
        break;
      case TimeType.applyEnd:
        if (this.checkApplyEndTime(time)) {
          this.setState({ body: { ...body, registerEndTime: time } }, () => {
            this.props.onChange(this.state.body);
          });
        }
        break;
      default:
        break;
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
    if (this.getTimestamp(time) > this.getTimestamp(activityEndTime)) {
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

  handleTitleChange = debounce((e) => {
    const { body } = this.state;
    this.setState({ body: { ...body, title: e.target.value } }, () => {
      this.props.onChange(this.state.body);
    });
  }, 400);

  handleContentChange = debounce((e) => {
    const { body } = this.state;
    this.setState({ body: { ...body, content: e.target.value } }, () => {
      this.props.onChange(this.state.body);
    });
  }, 400);

  handlePlaceChange = debounce((e) => {
    const { body } = this.state;
    this.setState({ body: { ...body, actPlace: e.target.value } }, () => {
      this.props.onChange(this.state.body);
    });
  }, 400)

  handleMoreClick = () => {
    this.setState({ showMore: !this.state.showMore });
  };

  handleLimitChange = (val) => {
    const { body } = this.state;
    this.setState({ body: { ...body, actPeopleLimitType: val } }, () => {
      this.props.onChange(this.state.body);
    });
  };

  handleLimitPeopleChange = (e) => {
    const val = Math.floor(e.target.value);
    if (val > 10000) {
      this.setState({ forceUpdate: !this.state.forceUpdate });
      Toast.info({ content: '报名人数不能大于10000'} );
      return;
    }
    const { body } = this.state;
    this.setState({ body: { ...body, totalNumber: val || "" } }, () => {
      this.props.onChange(this.state.body);
    });
  };

  handleTimeClick = (curClickTime) => {
    this.setState({ showMobileDatePicker: true, curClickTime });
    const { openModal } = this.timeRef.current;
    openModal(this.state.times);
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

  handleCheckAll = (val) => {
    const additionalInfoType = val ? Object.values(ATTACH_INFO_TYPE) : [];
    this.setState({ body: { ...this.state.body, additionalInfoType } }, () => {
      this.props.onChange(this.state.body);
    });
  };

  handleCheck = (list) => {
    this.setState({ body: { ...this.state.body, additionalInfoType: list } }, () => {
      this.props.onChange(this.state.body);
    });
  };

  render() {
    const { showMore, body } = this.state;
    const moreClass = !showMore
      ? classNames(styles['dzqp-act--more'], styles.fold) : classNames(styles['dzqp-act--more'], styles.expand);
    return (
      <>
        <View className={styles['dzqp-act--item']}>
          <View className={styles['dzqp-act--item_title']}>开始时间</View>
          <View className={styles['dzqp-act--item_right']} onClick={() => this.handleTimeClick(TimeType.actStart)}>
            <Text>{formatDate(body.activityStartTime, 'yyyy/MM/dd hh:mm:ss')}</Text>
            <Icon name="RightOutlined" size="8" />
          </View>
        </View>
        <View className={styles['dzqp-act--item']}>
          <View className={styles['dzqp-act--item_title']}>结束时间</View>
          <View className={styles['dzqp-act--item_right']} onClick={() => this.handleTimeClick(TimeType.actEnd)}>
            <Text>{formatDate(body.activityEndTime, 'yyyy/MM/dd hh:mm:ss')}</Text>
            <Icon name="RightOutlined" size="8" />
          </View>
        </View>
        <View className={moreClass} onClick={this.handleMoreClick}>
          <Text>高级设置</Text>
          <Icon name="RightOutlined" size="8" />
        </View>
        {showMore && (
          <>
            <View className={classNames(styles['dzqp-act--item'], styles['act-name'])}>
              <View className={styles['dzqp-act--item_title']}>活动名称</View>
              <Input
                className={styles['dzqp-act--item_right']}
                htmlType="text"
                mode="text"
                placeholder="最多支持50个字符"
                maxLength={50}
                value={body.title}
                onChange={this.handleTitleChange}
              />
            </View>
            <View className={classNames(styles['dzqp-act--item'], styles['act-detail'])}>
              <View className={classNames(styles['dzqp-act--item_title'], styles['width-auto'])}>
                活动详情 <Text>最多支持200个字符</Text>
              </View>
              <Textarea
                className={styles['dzqp-act--item_right']}
                placeholder="请输入活动介绍"
                rows={4}
                maxLength={200}
                value={body.content}
                onChange={this.handleContentChange}
              />
            </View>
            <View className={styles['dzqp-act--item']}>
              <View className={styles['dzqp-act--item_title']}>报名开始</View>
              <View className={styles['dzqp-act--item_right']} onClick={() => this.handleTimeClick(TimeType.applyStart)}>
                <Text>{body.registerStartTime && formatDate(body.registerStartTime, 'yyyy/MM/dd hh:mm:ss')}</Text>
                <Icon name="RightOutlined" size="8" />
              </View>
            </View>
            <View className={styles['dzqp-act--item']}>
              <View className={styles['dzqp-act--item_title']}>报名结束</View>
              <View className={styles['dzqp-act--item_right']} onClick={() => this.handleTimeClick(TimeType.applyEnd)}>
                <Text>{body.registerEndTime && formatDate(body.registerEndTime, 'yyyy/MM/dd hh:mm:ss')}</Text>
                <Icon name="RightOutlined" size="8" />
              </View>
            </View>
            <View className={styles['dzqp-act--item']}>
              <View className={styles['dzqp-act--item_title']}>活动地点</View>
              <View className={styles['dzqp-act--item_right']}>
                <Input
                  className={styles['dzqp-act--item_right']}
                  htmlType="text"
                  mode="text"
                  placeholder="请输入活动地点"
                  maxLength={50}
                  value={body.actPlace}
                  onChange={this.handlePlaceChange}
                />
              </View>
            </View>
            <View className={styles['dzqp-act--item']}>
              <View className={styles['dzqp-act--item_title']}>人数限制</View>
              <View className={styles['dzqp-act--item_right']}>
                <Radio.Group
                  onChange={this.handleLimitChange}
                  value={body.actPeopleLimitType}
                >
                  <Radio name={0}>不限制</Radio>
                  <Radio name={1}>
                    限<Input miniType="number" mode="number"
                      disabled={body.actPeopleLimitType === 0}
                      value={body.totalNumber}
                      onChange={this.handleLimitPeopleChange}
                      className={styles['dzqp-act__limit_input']}
                    />人报名
                  </Radio>
                </Radio.Group>
              </View>
            </View>
            <View className={classNames(styles['dzqp-act--item'], styles.options)}>
              <View className={styles.flex}>
                <View className={styles['dzqp-act--item_title']}>报名必填</View>
                <View className={styles['dzqp-act--item_right']}>
                  <Checkbox checked={body.additionalInfoType?.length === 4} onChange={this.handleCheckAll}>全选</Checkbox>
                </View>
              </View>
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
            </View>
          </>
        )}
        <DatePickers
          ref={this.timeRef}
          onConfirm={this.handleMobileTimeChange}
          initValue={this.getMobileCurClickTime()}
          wrap-class="my-class"
          select-item-class="mySelector"
        />
      </>
    );
  }
}
