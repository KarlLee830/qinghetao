import React, { useRef } from 'react';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import { View, Input, Image } from '@tarojs/components';
import { debounce, throttle } from '@common/utils/throttle-debounce.js';

import styles from './index.module.scss';
import { useEffect } from 'react';

/**
 * 搜索输入框
 * @prop {function} onSearch 搜索事件
 * @param {string} value 搜索字符串
 * @prop {function} onCancel 取消事件
 * @prop {string} defaultValue 默认值
 * @prop {string} isShowCancel 是否显示取消按钮
 */

const SearchInput = ({
  onSearch,
  onCancel,
  defaultValue = '',
  isShowCancel = true,
  isShowBottom = true,
  searchWhileTyping = false,
  searchWhileTypingStartsAt = 0,
  site,
  onInputClick = () => {},
}) => {
  const [value, setValue] = React.useState(defaultValue);
  const [isShow, setIsShow] = React.useState(false);
  const timeoutID = React.useRef(null);
  const inputRef = useRef(null);

  const inputChange = (e) => {
    const val = e.target.value;
    setValue(val);
    if (val.length > 0) {
      if(!isShow) setIsShow(true)
    }
    if(searchWhileTyping && val.length >= searchWhileTypingStartsAt) {
      if(timeoutID.current !== null) { // 做一个防抖Debounce
        clearTimeout(timeoutID.current);
        timeoutID.current = null;
      }
      timeoutID.current = setTimeout(() => {
        onSearch(val);
      }, searchWhileTyping ? 1000 : 0);
    }
  }

  const onEnter = (e) => {
    const val = e.target.value || "";
    if(timeoutID.current !== null) {
      clearTimeout(timeoutID.current);
      timeoutID.current = null;
    }
    timeoutID.current = setTimeout(() => {
      onSearch(val);
    }, 500);
  }

  const clearInput = () => {
    if(inputRef.current.props) {
      inputRef.current.props.value = '';
    }
    setValue('');
    setIsShow(false)
  }

  const renderHeaderLogo = () => {
    if (site?.webConfig?.setSite?.siteLogo !== '') {
      return <Image mode="aspectFit" alt="站点logo" className={styles.siteLogo} src={site?.webConfig?.setSite?.siteLogo} />;
    }
    return <Image mode="aspectFit" className={styles.siteLogo} alt="站点logo" src="/dzq-img/admin-logo-pc.png" />;
  };

  return (
    <View className={`${styles.container} ${!isShowBottom && styles.hiddenBottom}`}  onClick={onInputClick}>
      {renderHeaderLogo()}
      <View className={styles.inputWrapper}>
        <Icon className={styles.inputWrapperIcon} name="SearchOutlined" size={16} />
        <Input
          value={value}
          placeholder='请输入想要搜索的内容...'
          onEnter={debounce(e => onEnter(e), 400)}
          onInput={debounce(e => inputChange(e), 400)}
          className={styles.input}
          confirmType='search'
          onConfirm={e => onEnter(e)}
          placeholderClass={styles.placeholder}
          ref={inputRef}
          disabled={true}
        />
        {
          isShow && (
              <Icon className={styles.deleteIcon} name="WrongOutlined" size={16} onClick={clearInput}/>
          )
        }
      </View>
    </View>
  );
};

export default SearchInput;
