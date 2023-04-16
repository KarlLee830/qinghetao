import React, { useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import DDialog from '@components/dialog';
import { Radio, Input, Popup, Button, Toast } from '@discuzqsdk/design';
import ChooseFile from '@components/choose-file';
import classNames from 'classnames';
import styles from './index.module.scss';

const LOCAL = 'local';
const NETWORK = 'network';
const CHOOSE_TYPE = {
  [LOCAL]: '本地上传',
  [NETWORK]: '网络插入',
};

const urlDomain = [
  'player.bilibili.com',
  'em.iq.com',
  'player.youku.com',
  'music.163.com',
  'iqiyi',
  'youku',
  'xigua',
];

const IframeVideo = ({
  visible,
  pc,
  onCancel = () => { },
  onUploadChange = () => { },
  beforeUpload,
  threadPost,
}) => {
  const [value, setValue] = useState(LOCAL);
  const [confirmText, setConfirmText] = useState('上传');
  const [iframe, setIframe] = useState('');

  const handleInputChange = (e) => {
    const { value } = e.target;
    setIframe(value);
  };

  const handleConfirm = () => {
    if (value === LOCAL) return true;
    let isMatch = false;
    const iframeReg = /iframe/gi;
    if (iframeReg.test(iframe)) {
      const [srcValue] = iframe.match(/src=["']([\S]*[^\s<>"']*)["']/ig) || [];
      urlDomain.map((item) => {
        if (srcValue.indexOf(item) > -1) isMatch = true;
        return item;
      });
    }
    if (isMatch) {
      threadPost.setPostData({
        iframe: {
          content: iframe,
          type: 'iframe',
        },
      });
      onCancel();
    } else Toast.info({ content: 'iframe地址不符合要求' });
  };

  const content = (
    <>
      <Radio.Group defaultValue={value} className={styles['radio-reverse']} onChange={val => setValue(val)}>
        {Object.keys(CHOOSE_TYPE).map(item => <Radio name={item} key={item}>{CHOOSE_TYPE[item]}</Radio>)}
      </Radio.Group>
      {value === NETWORK && (
        <>
          <div className={styles.item}>
            <span className={styles.label}>网络音视频iframe代码</span>
            <Input value={iframe} onChange={e => handleInputChange(e)} />
          </div>
          <div className={classNames(styles.item, styles.flextop)}>
            <span className={styles.left}>*</span>
            <span className={styles.right}>目前仅支持插入爱奇艺、优酷、西瓜视频、B站视频；网易云音乐音频</span>
          </div>
        </>
      )}
    </>
  );

  useEffect(() => {
    if (value === LOCAL) setConfirmText('上传');
    if (value === NETWORK) setConfirmText('插入');
  }, [value]);

  if (!pc) return (
    <Popup
      className={styles.popup}
      position="bottom" // 从哪个地方弹出 'bottom' | 'top' | 'center';
      maskClosable={true} // 点击遮罩层是否关闭弹出层，但好像没什么用
      visible={visible} // 是否显示弹出层
      onClose={onCancel}
    >
      {content}
      <div className={styles.btn}>
        <Button onClick={onCancel}>取消</Button>
        <ChooseFile
            isChoose={value === LOCAL}
            onChange={onUploadChange}
            accept="video/*"
            limit={1}
            beforeUpload={beforeUpload}
          >
          <Button
            className={styles.confirmbtn}
            type="primary"
            disabled={value === NETWORK && !iframe}
            onClick={handleConfirm}>{confirmText}</Button>
        </ChooseFile>
      </div>
    </Popup>
  );

  return (
    <DDialog
      accept="video/*"
      limit={1}
      visible={visible}
      confirmText={confirmText}
      confirmType={value === LOCAL ? 'upload' : ''}
      beforeUpload={beforeUpload}
      onUploadChange={onUploadChange}
      onCacel={onCancel}
      onClose={onCancel}
      onConfirm={handleConfirm}
      confirmDisabled={value === NETWORK && !iframe}
      className={value === LOCAL ? styles.local : styles.network}>
      {content}
    </DDialog>
  );
};

export default inject('threadPost')(observer(IframeVideo));
