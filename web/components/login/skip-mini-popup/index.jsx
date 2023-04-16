import React from 'react';
import { Icon, Popup, Button } from '@discuzqsdk/design';
import styles from './index.module.scss';

const SkipMiniPopup = (props) => {
  const { visible, onOkClick, onCancel } = props;

  return (
    <Popup position="center" visible={visible} onClose={onCancel}>
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>提示</div>
            <div className={styles.headerIcon}>
              <Icon size={12} name="CloseOutlined" onClick={onCancel}></Icon>
            </div>
          </div>
        </div>
        <div className={styles.button}>
          <Button onClick={onCancel} className={styles.cancel}>
            继续留在当前页面
          </Button>
          <Button onClick={onOkClick} className={styles.ok} type="primary">
            跳转微信访问
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default SkipMiniPopup;
