import React, { useEffect, createRef, useState, Fragment } from 'react';
import { Icon, Popup, Textarea, Divider, Toast } from '@discuzqsdk/design';
import styles from './index.module.scss';
import classnames from 'classnames';
import ImageUpload from '@components/thread-post/image-upload';
import { readEmoji } from '@common/server';

import Emoji from '@components/editor/emoji';
import AtSelect from '@components/thread-post/at-select';
import { THREAD_TYPE } from '@common/constants/thread-post';

const InputPop = (props) => {
  const { visible, onSubmit, initValue, onClose, inputText = '写评论...', site } = props;

  const textareaRef = createRef();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const [emojis, setEmojis] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAt, setShowAt] = useState(false);
  const [showPicture, setShowPicture] = useState(false);

  const [imageList, setImageList] = useState([]);
  const [isDisabled, setDisabled] = useState(true);
  const [imageUploading, setImageUploading] = useState(false);
  useEffect(() => {
    setValue(initValue || '');
  }, [initValue]);
  useEffect(async () => {
    setShowEmojis(props.showEmojis);
    // 请求表情地址
    if (!emojis?.length) {
      const ret = await readEmoji();
      const { code, data = [] } = ret;
      if (code === 0) {
        setEmojis(data.map(item => ({ code: item.code, url: item.url })));
      }
    }
  }, [props.showEmojis]);
  useEffect(() => {
    setShowPicture(props.showPicture);
  }, [props.showPicture]);
  const onSubmitClick = async () => {
    if (loading || imageUploading) return;

    if (typeof onSubmit === 'function') {
      try {
        setLoading(true);
        const success = await onSubmit(value, imageList);
        if (success) {
          setValue('');
          setShowPicture(false);
          setImageList([]);
          setShowEmojis(false);
          setDisabled(true);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  };

  const onCancel = () => {
    setShowAt(false);
    setShowEmojis(false);
    setShowPicture(false);
    if (typeof props.cancleEmojie === 'function') {
      props.cancleEmojie();
    }
    if (typeof props.canclePicture === 'function') {
      props.canclePicture();
    }
    onClose();
  };

  const onEmojiIconClick = async () => {
    setShowEmojis(!showEmojis);
    setShowAt(false);
    setShowPicture(false);

    // 请求表情地址
    if (!emojis?.length) {
      const ret = await readEmoji();
      const { code, data = [] } = ret;
      if (code === 0) {
        setEmojis(data.map(item => ({ code: item.code, url: item.url })));
      }
    }
  };

  const onAtIconClick = () => {
    setShowAt(!showAt);
    setShowEmojis(false);
    setShowPicture(false);
  };

  const onPcitureIconClick = () => {
    setShowPicture(!showPicture);
    setShowEmojis(false);
    setShowAt(false);
  };

  // 完成表情选择
  const onEmojiClick = (emoji) => {
    // 在光标位置插入
    const insertPosition = textareaRef?.current?.selectionStart || 0;
    const newValue = value.substr(0, insertPosition) + (emoji.code || '') + value.substr(insertPosition);
    setValue(newValue);
    if (newValue.length > 0 && isDisabled) {
      setDisabled(false);
    }
    if (newValue.length === 0 && !isDisabled) {
      setDisabled(true);
    }
    // setShowEmojis(false);
  };

  // 完成@人员选择
  const onAtListChange = (atList) => {
    // 在光标位置插入
    const atListStr = atList.map(atUser => ` @${atUser} `).join('');
    const insertPosition = textareaRef?.current?.selectionStart || 0;
    const newValue = value.substr(0, insertPosition) + (atListStr || '') + value.substr(insertPosition);
    setValue(newValue);

    setShowEmojis(false);
    if (atList.length > 0 && isDisabled) {
      setDisabled(false);
    }
    if (atList.length === 0 && !isDisabled) {
      setDisabled(true);
    }
  };

  const handleUploadChange = async (list) => {
    setImageList([...list]);
    if (list.length > 0 && isDisabled) {
      setDisabled(false);
    }
    if (list.length === 0 && !isDisabled && value.length === 0) {
      setDisabled(true);
    }
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
        let imageType = '';
        if (item.imageType) {
          imageType = item.imageType;
        } else {
          const arr = item.name.split('.').pop();
          imageType = arr.toLocaleLowerCase();
        }

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
    setImageUploading(list?.length && list.some(image => image.status === 'uploading'));
  };

  const onFail = (ret) => {
    const msg = ret?.msg;
    const code = ret?.code === -7075 || ret?.code === -4002; // 错误码为-7075时为不允许上传敏感图
    Toast.error({
      content: code ? msg : '图片上传失败',
    });
  };

  const handleChange = (e) => {
    setValue(e.target.value);
    if (e.target.value.length > 0 && isDisabled) {
      setDisabled(false);
    }
    if (e.target.value.length === 0 && !isDisabled && imageList.length === 0) {
      setDisabled(true);
    }
  };
  return (
    <div>
      <Popup position="bottom" visible={visible} onClose={onCancel}>
        <div className={styles.container}>
          <div className={styles.main}>
            <Textarea
              className={styles.input}
              maxLength={5000}
              rows={4}
              showLimit={false}
              value={value}
              onChange={e => handleChange(e)}
              placeholder={inputText}
              disabled={loading}
              forwardedRef={textareaRef}
              autoFocus={true}
              onFocus={() => setShowEmojis(false)}
            ></Textarea>
          </div>

          {showPicture && (
            <Fragment>
              <div className={styles.imageUpload}>
                <ImageUpload
                  fileList={imageList}
                  onChange={handleUploadChange}
                  onComplete={onComplete}
                  beforeUpload={(cloneList, showFileList) => beforeUpload(cloneList, showFileList, THREAD_TYPE.image)}
                  onFail={onFail}
                />
              </div>
              <Divider className={styles.divider}></Divider>
            </Fragment>
          )}

          <div className={styles.button}>
            <div className={styles.operates}>
              <Icon
                className={classnames(styles.operate, showEmojis && styles.actived)}
                name="SmilingFaceOutlined"
                size={20}
                onClick={onEmojiIconClick}
              ></Icon>
              <Icon
                className={classnames(styles.operate, showAt && styles.actived)}
                name="AtOutlined"
                size={20}
                onClick={onAtIconClick}
              ></Icon>
              <Icon
                className={classnames(styles.operate, showPicture && styles.actived)}
                name="PictureOutlinedBig"
                size={20}
                onClick={onPcitureIconClick}
              ></Icon>
            </div>

            <div
              onClick={onSubmitClick}
              className={classnames(styles.ok, (loading || imageUploading || isDisabled) && styles.disabled)}
            >
              发布
            </div>
          </div>
        </div>
        {showEmojis && (
          <div className={styles.emojis}>
            <Emoji show={showEmojis} emojis={emojis} onClick={onEmojiClick} />
          </div>
        )}
        <div className={styles.safeArea}></div>
      </Popup>

      {showAt && <AtSelect visible={showAt} getAtList={onAtListChange} onCancel={onAtIconClick} />}
    </div>
  );
};

export default InputPop;
