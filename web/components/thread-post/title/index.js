/**
 * 发帖页标题
 * @prop {string} title 输入标题值
 * @prop {string} placeholder
 * @prop {boolean} isDisplay 是否显示标题
 * @prop {function} onChange change事件，输出当前标题值
 */
import React, { memo, useState, useEffect } from 'react';
import { Input } from '@discuzqsdk/design';
import styles from './index.module.scss';

import PropTypes from 'prop-types';

const Title = ({ title, placeholder, isDisplay, onChange,  onFocus, onBlur, ...props }) => {
  const clsName = props.pc ? `${styles.wrapper} ${styles.pc}` : styles.wrapper;

  return (
    <div id="dzq-threadpost-title" className={`${isDisplay ? clsName : styles['is-display']}`}
      onClick={e => e.stopPropagation()}
    >
      <Input
        className={`${styles.title} ${isDisplay ? styles['is-display'] : ''}`}
        value={title}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        maxLength={100}
        {...props}
        focus={false}
      />
    </div>
  );
};

Title.propTypes = {
  title: PropTypes.string,
  isDisplay: PropTypes.bool,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

// 设置props默认类型
Title.defaultProps = {
  title: '',
  isDisplay: false,
  placeholder: '标题（可选）',
  onChange: () => { },
  onFocus: () => { },
  onBlur: () => { },
};

export default memo(Title);
