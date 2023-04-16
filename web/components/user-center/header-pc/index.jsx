import React, { useState } from 'react';
import { Icon, Spin } from '@discuzqsdk/design';
import UserCenterHeaderImage from '@components/user-center-header-images';
import UserCenterHead from '@components/user-center-head';
import styles from './index.module.scss';

const UserCenterHeaderPc = (props) => {
  const {
    isOtherPerson = false,
    showHeaderLoading = true,
  } = props;

  const [isUploadBackgroundUrl, setBackgroundUrl] = useState(false);

  const handleSetBgLoadingStatus = (bol) => {
    setBackgroundUrl(bol);
  };

  return (
    <div className={styles.headerbox}>
    <div className={styles.userHeader}>
      {!showHeaderLoading && (
        <>
          <div className={styles.headImgWrapper}>
            <UserCenterHeaderImage isOtherPerson={isOtherPerson} />
            {isUploadBackgroundUrl && (
              <div className={styles.uploadBgUrl}>
                <div className={styles.uploadCon}>
                  <Icon name="UploadingOutlined" size={12} />
                  <span className={styles.uploadText}>上传中...</span>
                </div>
              </div>
            )}
          </div>
          <UserCenterHead
            handleSetBgLoadingStatus={handleSetBgLoadingStatus}
            platform="pc"
            isOtherPerson={isOtherPerson}
          />
        </>
      )}
      {showHeaderLoading && (
        <div className={styles.spinLoading}>
          <Spin size={16} type="spinner">
            加载中...
          </Spin>
        </div>
      )}
    </div>
  </div>
  );
};

export default UserCenterHeaderPc;
