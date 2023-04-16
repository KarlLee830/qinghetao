import React from 'react';
import { View, Text, CustomWrapper } from '@tarojs/components';
import { Input } from '@discuzqsdk/design';
import actEntryStyles from '../../../entry/adapter/index.module.scss';
import { ATTACH_INFO_TYPE, ATTACH_INFO_NAME } from '@common/plugin/custom-apply/View/src/common';
import { debounce } from '@common/utils/throttle-debounce';

export default class CustomApplyAttach extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      additionalInfo: {},
    };
  }

  componentDidUpdate(prevProps) {
    if (this.props.activityId !== prevProps.activityId) {
      this.setState({ additionalInfo: {} });
    }
  }

  handleAttachInfoChange = (e, item) => {
    const { key } = ATTACH_INFO_NAME[item?.toString()] || {};
    if (!key) return;
    const { additionalInfo } = this.state;
    let val = e.target.value;
    if (item === ATTACH_INFO_TYPE.mobile) {
      val = val.match(/\d{0,11}/g)[0] || "";
    }
    additionalInfo[key] = val;
    this.setState({ additionalInfo }, () => {
      this.props.onChange(this.state.additionalInfo);
    });
  };

  render() {
    const { additionalInfo } = this.state;
    const { renderData } = this.props;
    const { body } = renderData || {};
    const { additionalInfoType = [] } = body || {};
    return (additionalInfoType || []).map(item => (<View className={actEntryStyles['dzqp-act--item']}>
      <View className={actEntryStyles['dzqp-act--item_title']} key={item}>
        {ATTACH_INFO_NAME[item?.toString()]?.value}
      </View>
      <View className={actEntryStyles['dzqp-act--item_right']}>
        <CustomWrapper>
          <Input
            key={item}
            className={actEntryStyles['dzqp-act--item_right']}
            miniType={item === ATTACH_INFO_TYPE.mobile ? 'number' : 'text'}
            mode={item === ATTACH_INFO_TYPE.mobile ? 'number' : 'text'}
            placeholder={`请输入${ATTACH_INFO_NAME[item?.toString()]?.value}`}
            maxLength={50}
            value={additionalInfo[ATTACH_INFO_NAME[item?.toString()]?.key] || ''}
            onChange={e => this.handleAttachInfoChange(e, item)}
          />
        </CustomWrapper>
      </View>
    </View>));
  }
}
