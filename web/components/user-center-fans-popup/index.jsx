import React from 'react';
import styles from './index.module.scss';
import { Dialog, Divider } from '@discuzqsdk/design';
import UserCenterFans from '@components/user-center-fans';
import { noop } from '@components/thread/utils';
import Router from '@discuzqsdk/sdk/dist/router';
import ReactDOM from 'react-dom';

/**
 * 粉丝弹框
 * @prop {boolean} visible 是否显示弹框
 * @prop {function} onClose 弹框关闭事件
 */
const Index = (props) => {
  const {
    visible = false,
    onClose = noop,
    id,
    dataSource,
    setDataSource,
    sourcePage,
    updateSourcePage,
    sourceTotalPage,
    updateSourceTotalPage,
  } = props;

  const onContainerClick = ({ id }) => {
    id && Router.push({ url: `/user/${id}` });
  };

  const splitElement = React.useMemo(
    () => (
      <div className={styles.splitElement}>
        <Divider />
      </div>
    ),
    [],
  );

  const otherProps = id ? { userId: id } : {};

  const dialogElement = (
    <Dialog
      visible={visible}
      position="center"
      isNew={true}
      title="粉丝"
      width={572}
      headerClassName={styles.dialogHeader}
      bodyClassName={styles.dialogBody}
      footerClassName={styles.dialogFooter}
      footer={<div></div>}
      onClose={onClose}
    >
      <div className={styles.container}>
        <div className={styles.titleHr}></div>
        <UserCenterFans
          styles={{ height: '100%' }}
          dataSource={dataSource}
          setDataSource={setDataSource}
          sourcePage={sourcePage}
          updateSourcePage={updateSourcePage}
          sourceTotalPage={sourceTotalPage}
          updateSourceTotalPage={updateSourceTotalPage}
          onContainerClick={onContainerClick}
          splitElement={splitElement}
          {...otherProps}
        />
      </div>
    </Dialog>
  );

  if (typeof window === 'undefined') {
    return dialogElement;
  }

  return ReactDOM.createPortal(dialogElement, document.getElementsByTagName('body')[0]);
};

export default React.memo(Index);
