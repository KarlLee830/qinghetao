import React from 'react';
import { View, Text } from '@tarojs/components';
import { Icon } from '@discuzqsdk/design';
import classNames from 'classnames';
import styles from '../index.module.scss';

export default class CustomApplyPost extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { renderData, deletePlugin, _pluginInfo, updatePlugin } = this.props;
    if (!renderData) return null;
    if (renderData && renderData?.tomId === _pluginInfo.options.tomId) {
      const { body } = renderData || {};
      const { activityStartTime } = body || {};
      if (!activityStartTime) return null;
    }

    return (
      <View className={classNames(styles['dzqp-post-widget'], styles['dzqp-mini'])}
        onClick={() => {
          updatePlugin({ postData: renderData, _pluginInfo, isShow: true });
        }}
      >
        <View className={styles['dzqp-post-widget__right']}>
          <Icon className={styles['dzqp-post-widget__icon']} name='ApplyOutlined' />
          <Text className={styles['dzqp-post-widget__text']}>活动报名</Text>
        </View>
        <Icon
          className={styles['dzqp-post-widget__left']}
          name='DeleteOutlined'
          onClick={(e) => {
            e.stopPropagation();
            deletePlugin();
          }}
        />
      </View>
    );
  }
}
