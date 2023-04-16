import React from 'react';
import styles from './index.module.scss';
import typeofFn from '@utils/typeof';

const noop = () => { };
const ChooseFile = ({
  children,
  isChoose = true,
  limit = 1,
  accept = '*/*',
  onChange = noop,
  beforeUpload = () => true,
}) => {
  const inputRef = React.createRef(null);

  const handleChange = (e) => {
    if (e.target instanceof HTMLInputElement) {
      const { files } = e.target;
      if (!files) return;

      if (typeofFn.isFunction(onChange)) onChange(files);
      inputRef.current.value = null;
    }
  };

  const triggerInput = () => {
    if (typeofFn.isFunction(beforeUpload) && beforeUpload()) inputRef.current.click();
    if (!typeofFn.isFunction(beforeUpload)) inputRef.current.click();
  };

  if (!isChoose) return children;

  return (
    <div onClick={triggerInput} className={styles.wrapper}>
      {children}
      <input
        style={{ display: 'none' }}
        type="file"
        ref={inputRef}
        onChange={(e) => {
          handleChange(e);
        }}
        multiple={limit > 1}
        accept={accept}
      />
    </div>
  );
};

export default ChooseFile;
