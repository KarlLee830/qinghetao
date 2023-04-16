/**
 * 发帖页 - 底部选项框
 */
import React, { memo } from 'react';
import { View } from '@tarojs/components';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import styles from './index.module.scss';

import PropTypes from 'prop-types';

const PaidTypePopup = ({ show, list, onClick, onHide }) => {
  return (
    <Popup
      className={styles.wrapper}
      visible={show}
      position="bottom"
      maskClosable={true}
      onClose={onHide}
    >
      <View className={styles.content}>
        {list.map(item => (
          <View className={styles.item} key={item} onClick={() => onClick(item)}>
            {item.name}
          </View>
        ))}
        <View className={styles.btn} onClick={onHide}>取消</View>
      </View>
    </Popup>
  );
};

PaidTypePopup.propTypes = {
  show: PropTypes.bool.isRequired,
  list: PropTypes.array,
  onClick: PropTypes.func,
  onHide: PropTypes.func,
};

PaidTypePopup.defaultProps = {
  show: false,
  list: [],
  onClick: () => { },
  onHide: () => { },
};

export default memo(PaidTypePopup);
