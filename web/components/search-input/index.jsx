import React from 'react';
import { Input, Icon } from '@discuzqsdk/design';


import styles from './index.module.scss';

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
}) => {
  const [value, setValue] = React.useState(defaultValue);
  const [isShow, setIsShow] = React.useState(false);
  const timeoutID = React.useRef(null);

  const inputChange = (e) => {
    const val = e.target.value;
    setValue(val);
    if (val.length > 0) {
      setIsShow(true);
    }
    if (searchWhileTyping && val.length >= searchWhileTypingStartsAt) {
      if (timeoutID.current !== null) { // 做一个防抖Debounce
        clearTimeout(timeoutID.current);
        timeoutID.current = null;
      }
      timeoutID.current = setTimeout(() => {
        onSearch(val);
      }, searchWhileTyping ? 1000 : 0)
    }
  };

  const onEnter = (e) => {
    const val = e.target.value || "";
    if (timeoutID.current !== null) {
      clearTimeout(timeoutID.current);
      timeoutID.current = null;
    }

    timeoutID.current = setTimeout(() => {
      onSearch(val);
    }, searchWhileTyping ? 500 : 0);
  };

  const clearInput = () => {
    setValue('');
    setIsShow(false);
  };

  return (
    <div className={`${styles.container} ${!isShowBottom && styles.hiddenBottom}`}>
      <div className={styles.inputWrapper}>
        <Icon className={styles.inputWrapperIcon} name="SearchOutlined" size={16} />
        <Input
          value={value}
          placeholder='请输入想要搜索的内容...'
          onEnter={e => onEnter(e)}
          onChange={e => inputChange(e)}
          className={styles.input}
          autoComplete={'off'}
        />
        {
          isShow && (
            <Icon className={styles.deleteIcon} name="WrongOutlined" size={16} onClick={clearInput}/>
          )
        }
      </div>
      {
        isShowCancel && (
          <div className={styles.cancel} onClick={onCancel}>
            取消
          </div>
        )
      }
    </div>
  );
};

export default SearchInput;
