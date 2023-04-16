import React from 'react';
import { Icon } from '@discuzqsdk/design';
import classNames from 'classnames';
import styles from '../index.module.scss';

export default class CustomApplyPost extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { siteData, renderData, deletePlugin, _pluginInfo, updatePlugin } = this.props;
    const isPC = siteData.platform === 'pc';
    if (!renderData) return null;
    if (renderData && renderData?.tomId === _pluginInfo.options.tomId) {
      const { body } = renderData || {};
      const { activityStartTime } = body || {};
      if (!activityStartTime) return null;
    }
    return (
      <div className={classNames(styles['dzqp-post-widget'], isPC && styles['dzqp-pc'])}
        onClick={(e) => {
          e.stopPropagation();
          updatePlugin({ postData: renderData, _pluginInfo, isShow: true });
        }}
      >
        <div className={styles['dzqp-post-widget__right']}>
          <Icon className={styles['dzqp-post-widget__icon']} name='ApplyOutlined' />
          <span className={styles['dzqp-post-widget__text']}>活动报名</span>
        </div>
        <Icon
          className={styles['dzqp-post-widget__left']}
          name='DeleteOutlined'
          onClick={(e) => {
            e.stopPropagation();
            deletePlugin();
          }}
        />
      </div>
    );
  }
}
