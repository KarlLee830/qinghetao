/**
 * 发帖页内容
 * @prop {string} value 绑定值
 * @prop {string} placeholder 站位内容
 * @prop {string} disabled 是否禁用
 * @prop {string} maxLength 最大长度
 * @prop {function} onChange onChange事件，输出当前文本框内容
 * @prop {function} onFocus 聚焦事件
 * @prop {function} onBlur 失焦事件
 */
import React, { useState, useEffect, memo, forwardRef } from 'react';
import Taro from "@tarojs/taro";
import { View, Textarea } from '@tarojs/components';
import { debounce } from '@common/utils/throttle-debounce.js';
import classNames from 'classnames';
import styles from './index.module.scss';

import PropTypes from 'prop-types';

/**
 * 发帖文本输入
 * android:使用 autoHeight 自增高 ，style.height失效。
 * ios: autoHeight存在兼容性问题，通过JS控制 style.height进行高度变化
 * */
const Index = forwardRef(({
  value,
  postType,
  navInfo,
  placeholder,
  disabled,
  showEmoji,
  bottomHeight,
  maxLength,
  onChange,
  onFocus,
  onBlur,
}, ref) => {
  const [isAndroid, setIsAndroid] = useState(false);
  const [initialized, setInitialized] = useState(false); // IOS textarea 高度是否已经初始化
  const [realHeight, setRealHeight] = useState(260); // IOS textarea展开时的真实高度
  const [defaultHeight, setDefaultHeight] = useState(260); // 输入时显示的半屏高度

  // 兼容ios，监听换行更新高度
  const onLineChange = (e) => {
    /*
    * 非首次发帖时，初始化IOS文本域高度
    * 初始化渲染时IOS系统默认使用了22px的行高，css中真实行高确是28px。需要补偿展示高度
    */
    if (postType !== 'isFirst' && e.detail.lineCount > 1 && !initialized) {
      setRealHeight(parseInt(e.detail.height * (28 / 22) + 120));
      setInitialized(true);
      return;
    }

    if (realHeight - e.detail.height > 150) return; // 忽略非正常状态下行数超过5行的快速下降

    if ((bottomHeight > 0 || showEmoji) && e.detail.height > defaultHeight) { // 输入时更新内容真实高度
      setRealHeight(e.detail.height);
    };
  }

  useEffect(() => {
    Taro.getSystemInfo({
      success: (res) => {
        res?.platform !== 'ios' && setIsAndroid(true);
        if (bottomHeight) {
          const {statusBarHeight, navHeight} = navInfo;
          const _height = res.screenHeight - statusBarHeight - navHeight - bottomHeight - 200; // 200 为标题、操作栏高度加一点间距之和
          setDefaultHeight(_height);
        }
      }
    });
  }, [bottomHeight])

  if (isAndroid) {
    return (
      <View className={styles.container} onClick={e => e.stopPropagation()}>
        <View className={styles['container-inner']}>
          <Textarea
            ref={ref}
            className={classNames(styles.textarea, !!value && styles['textarea-editing'], styles['textarea-min-height'])}
            style={(bottomHeight > 0 || showEmoji) ? `max-height:${defaultHeight}px` : ''}
            placeholderClass={styles['textarea-placeholder']}
            // value={value}
            value={value}
            disabled={disabled}
            focus
            placeholder={placeholder}
            maxlength={maxLength}
            autoHeight
            showConfirmBar={false}
            onFocus={onFocus}
            onBlur={onBlur}
            autoFocus
            cursorSpacing={200}
            onInput={e => onChange(e.target.value, maxLength)}
            // 键盘弹起时，不自动上推页面。此属性解决键盘弹起页面上推导致工具栏以及header显示异常
            adjustPosition={false}
          />
        </View>
      </View>
    )
  }

  return (
    <View className={styles.container} onClick={e => e.stopPropagation()}>
      <View className={styles['container-inner']}>
        <Textarea
          ref={ref}
          className={classNames(styles.textarea, !!value && styles['textarea-editing'])}
          placeholderClass={styles['textarea-placeholder']}
          disabled={disabled}
          placeholder={placeholder}
          value={value}
          maxlength={maxLength}
          style={(bottomHeight > 0 || showEmoji)
            ? `height:${defaultHeight}px;`
            : `height:${realHeight > defaultHeight ? realHeight : defaultHeight}px;`
          }
          showConfirmBar={false}
          onFocus={onFocus}
          autoFocus
          focus
          onBlur={onBlur}
          cursorSpacing={200}
          onInput={e => onChange(e.target.value, maxLength)}
          // 键盘弹起时，不自动上推页面。此属性解决键盘弹起页面上推导致工具栏以及header显示异常
          adjustPosition={false}
          onLineChange={debounce(onLineChange, 100)}
        />
      </View>
    </View>
  );
});

Index.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  maxLength: PropTypes.number,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
};

// 设置props默认类型
Index.defaultProps = {
  value: '',
  placeholder: '请填写您的发布内容...',
  disabled: false,
  maxLength: 5000,
  onChange: () => { },
  onFocus: () => { },
  onBlur: () => { },
};

export default memo(Index);
