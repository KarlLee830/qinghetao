// 主要是用于pc，等后期基础组件优化好之后再去掉
import React from 'react';
import { Icon, Dialog, Button } from '@discuzqsdk/design';
import styles from './index.module.scss';
import ChooseFile from '@components/choose-file';

export default function DDialog(props) {
  const { title, children,
    onClose = () => { },
    onCacel = () => { },
    onConfirm = () => { },
    confirmDisabled = false,
    isCustomBtn = false,
    className,
    confirmText = '确定',
    confirmType = '', // upload 代表是上传
    beforeUpload = () => true,
    onUploadChange = () => { },
    limit = 1,
    accept = '*/*',
    ...other
  } = props;
  const header = (
    <div className={styles['pc-header']}>
      {title}
      <Icon
        className={styles['pc-closeicon']}
        name="CloseOutlined"
        size={12}
        onClick={onClose}
      />
    </div>
  );

  return (
    <Dialog
      className={`${className} ${styles.pc}`}
      header={header}
      onClose={onClose}
      {...other}
    >
      {children}
      {!isCustomBtn && (
        <div className={styles.btn}>
          <Button onClick={() => onCacel()}>取消</Button>
          <ChooseFile
            isChoose={confirmType === 'upload'}
            beforeUpload={beforeUpload}
            onChange={onUploadChange}
            accept={accept}
            limit={limit}
          >
            <Button className={styles.confirmbtn} type="primary" disabled={confirmDisabled} onClick={() => onConfirm()}>{confirmText}</Button>
          </ChooseFile>
        </div>
      )}
    </Dialog>
  );
}
