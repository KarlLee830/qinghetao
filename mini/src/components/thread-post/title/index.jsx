/**
 * 发帖页标题
 * @prop {string} title 输入标题值
 * @prop {string} placeholder
 * @prop {boolean} show 是否显示标题
 * @prop {function} onChange change事件
 * @prop {function} onBlur 失焦事件
 */
import React, { memo } from 'react';
import { View } from '@tarojs/components';
import Input from '@discuzqsdk/design/dist/components/input/index';
import { debounce, throttle } from '@common/utils/throttle-debounce.js';

import styles from './index.module.scss';

import PropTypes from 'prop-types';

const Index = ({ value, show, placeholder, onChange, onBlur, onFocus }) => (
    <View
      className={`${styles.container} ${show ? '' : styles['is-display']}`}
      onClick={e => e.stopPropagation()}
    >
      <Input
        value={value}
        mode='text'
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onBlur={onBlur}
        onFocus={onFocus}
        maxLength={100}
      />
    </View>
  );

Index.propTypes = {
  value: PropTypes.string,
  show: PropTypes.bool,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  onFocus: PropTypes.func,
};

// 设置props默认类型
Index.defaultProps = {
  value: '',
  show: true,
  placeholder: '标题(可选)',
  onChange: () => {},
  onBlur: () => {},
  onFocus: () => {},
};

export default memo(Index);
