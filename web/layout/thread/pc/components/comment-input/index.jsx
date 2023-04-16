import React, { createRef, useEffect, useState, Fragment, useCallback } from 'react';
import { Textarea, Toast, Divider, Button, Icon } from '@discuzqsdk/design';
import styles from './index.module.scss';
import { readEmoji } from '@common/server';

import { THREAD_TYPE } from '@common/constants/thread-post';
import ImageUpload from '@components/thread-post/image-upload';
import Emoji from '@components/editor/emoji';
import AtSelect from '@components/thread-post/at-select';

import classnames from 'classnames';
import { inject } from 'mobx-react';

const hongbaoMini = 'https://cloudcache.tencentcs.com/operation/dianshi/other/redpacket-mini.10b46eefd630a5d5d322d6bbc07690ac4536ee2d.png';


const CommentInput = inject('site')((props) => {
  const { onSubmit, onClose, height, initValue = '', placeholder = '写下我的评论...', site, hasHongbao} = props;

  const textareaRef = createRef();

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const [placeholderState, setPlaceholder] = useState('');

  const [emojis, setEmojis] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAt, setShowAt] = useState(false);

  const [showPicture, setShowPicture] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [cursorPos, setCursorPos] = useState(0);

  useEffect(() => {
    setPlaceholder(placeholder);
  }, [placeholder]);

  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  // 点击其他地方emoji输入框收起
  useEffect(() => {
    showEmojis ? window.addEventListener('click', onEventClick) : window.removeEventListener('click', onEventClick);

    return () => {
      window.removeEventListener('click', onEventClick);
    };
  }, [showEmojis]);

  const onEventClick = useCallback((e) => {
    e && e.stopPropagation();
    if (e.target.id === 'emojiBtn') {
      // setShowEmojis(!showEmojis);
      return;
    }
    setCursorPos(0);
    setShowEmojis(false);
  }, []);

  const onSubmitClick = async () => {
    if (typeof onSubmit === 'function') {
      try {
        setLoading(true);
        const success = await onSubmit(value, imageList);
        if (success) {
          setValue('');
          setShowPicture(false);
          setImageList([]);
        }
        setLoading(false);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onEmojiIconClick = async () => {
    if (typeof props.onEmojiIconClick === 'function' && !props.onEmojiIconClick()) {
      return;
    }

    setCursorPos(0);
    setShowEmojis(!showEmojis);
    setShowAt(false);

    // 请求表情地址
    if (!emojis?.length) {
      const ret = await readEmoji();
      const { code, data = [] } = ret;
      if (code === 0) {
        setEmojis(data.map((item) => ({ code: item.code, url: item.url })));
      }
    }
  };

  const onAtIconClick = () => {
    if (typeof props.onAtIconClick === 'function' && !props.onAtIconClick()) {
      return;
    }

    setShowAt(!showAt);
    setCursorPos(0);
    setShowEmojis(false);
  };

  const onPcitureIconClick = () => {
    if (typeof props.onPcitureIconClick === 'function' && !props.onPcitureIconClick()) {
      return;
    }

    setShowPicture(!showPicture);
    setCursorPos(0);
    setShowEmojis(false);
    setShowAt(false);
  };

  // 完成选择表情
  const onEmojiClick = (emoji) => {
    // 在光标位置插入
    let insertPosition = 0;
    if (cursorPos === 0) {
      insertPosition = textareaRef?.current?.selectionStart || 0;
    } else {
      insertPosition = cursorPos;
    }
    const newValue = value.substr(0, insertPosition) + (emoji.code || '') + value.substr(insertPosition);
    setValue(newValue);
    setCursorPos(insertPosition + emoji.code.length);

    // setShowEmojis(false);
  };

  // 完成选择@人员
  const onAtListChange = (atList) => {
    // 在光标位置插入
    const atListStr = atList.map((atUser) => ` @${atUser} `).join('');
    const insertPosition = textareaRef?.current?.selectionStart || 0;
    const newValue = value.substr(0, insertPosition) + (atListStr || '') + value.substr(insertPosition);
    setValue(newValue);

    setCursorPos(0);
    setShowEmojis(false);
  };

  const handleUploadChange = async (list) => {
    setImageList([...list]);
  };

  // 附件、图片上传之前
  const beforeUpload = (cloneList, showFileList, type) => {
    const { webConfig } = site;
    if (!webConfig) return false;
    // 站点支持的文件类型、文件大小
    const { supportFileExt, supportImgExt, supportMaxSize } = webConfig.setAttach;
    if (type === THREAD_TYPE.file) {
      // 当前选择附件的类型大小
      const arr = cloneList[0].name.split('.').pop();
      const fileType = arr.toLocaleLowerCase();
      const fileSize = cloneList[0].size;
      // 判断合法性
      const isLegalType = supportFileExt.toLocaleLowerCase().includes(fileType);
      const isLegalSize = fileSize > 0 && fileSize < supportMaxSize * 1024 * 1024;
      if (!isLegalType) {
        Toast.info({ content: '当前文件类型暂不支持' });
        return false;
      }
      if (!isLegalSize) {
        Toast.info({ content: `上传附件大小范围0 ~ ${supportMaxSize}MB` });
        return false;
      }
    } else if (type === THREAD_TYPE.image) {
      // 剔除超出数量9的多余图片
      const remainLength = 9 - showFileList.length; // 剩余可传数量
      cloneList.splice(remainLength, cloneList.length - remainLength);

      let isAllLegal = true; // 状态：此次上传图片是否全部合法
      cloneList.forEach((item, index) => {
        const arr = item.name.split('.').pop();
        const imageType = arr.toLocaleLowerCase();
        const isLegalType = supportImgExt.toLocaleLowerCase().includes(imageType);

        // 存在不合法图片时，从上传图片列表删除
        if (!isLegalType) {
          cloneList.splice(index, 1);
          isAllLegal = false;
        }
      });

      !isAllLegal && Toast.info({ content: `仅支持${supportImgExt}类型的图片` });

      cloneList?.length && setImageUploading(true);

      return true;
    }

    return true;
  };

  const onComplete = (value, file, list) => {
    if (value.code === 0) {
      file.response = value.data;
    }
    setImageUploading(list?.length && list.some((image) => image.status === 'uploading'));
  };

  const onFail = (ret) => {
    const msg = ret?.msg;
    const code = ret?.code === -7075 || ret?.code === -4002; // 错误码为-7075时为不允许上传敏感图
    Toast.error({
      content: code ? msg : '图片上传失败',
    });
  };

  const onFocus = (e) => {
    typeof props.onFocus === 'function' && props.onFocus(e);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.main} ${hasHongbao ? styles.hasHongbao : ''}`}>
        {hasHongbao && <img className={styles.hongbaoMini} src={hongbaoMini}></img>}
        <Textarea
          className={`${styles.input} ${height === 'label' ? styles.heightLabel : styles.heightMiddle}`}
          rows={5}
          maxLength={5000}
          showLimit={true}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholderState}
          disabled={loading}
          forwardedRef={textareaRef}
          onFocus={onFocus}
        ></Textarea>

        {showPicture && (
          <Fragment>
            <Divider className={styles.divider}></Divider>

            <div className={styles.imageUpload}>
              <ImageUpload
                fileList={imageList}
                onChange={handleUploadChange}
                onComplete={onComplete}
                beforeUpload={(cloneList, showFileList) => beforeUpload(cloneList, showFileList, THREAD_TYPE.image)}
                onFail={onFail}
              />
            </div>
          </Fragment>
        )}
      </div>

      {showAt && <AtSelect pc visible={showAt} getAtList={onAtListChange} onCancel={onAtIconClick} />}

      <div className={styles.footer}>
        {showEmojis && <Emoji pc show={showEmojis} emojis={emojis} onClick={onEmojiClick} atTop={false} />}

        <div className={styles.linkBtn}>
          <Icon
            name="SmilingFaceOutlined"
            size="20"
            className={classnames(styles.btnIcon, showEmojis && styles.actived)}
            onClick={onEmojiIconClick}
            id="emojiBtn"
          ></Icon>
          <Icon
            name="AtOutlined"
            size="20"
            className={classnames(styles.btnIcon, showAt && styles.actived)}
            onClick={onAtIconClick}
          ></Icon>
          <Icon
            name="PictureOutlinedBig"
            size="20"
            className={classnames(styles.btnIcon, showPicture && styles.actived)}
            onClick={onPcitureIconClick}
          ></Icon>
        </div>

        <Button
          loading={loading}
          disabled={imageUploading}
          onClick={onSubmitClick}
          className={styles.button}
          type="primary"
          size="large"
        >
          发布
        </Button>
      </div>
    </div>
  );
});

export default CommentInput;
