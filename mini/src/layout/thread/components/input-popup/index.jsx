import React, { useEffect, useState, createRef, Fragment } from 'react';
import { inject, observer } from 'mobx-react';
import { View, CustomWrapper } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import Textarea from '@discuzqsdk/design/dist/components/textarea/index';
import Divider from '@discuzqsdk/design/dist/components/divider/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import classnames from 'classnames';
import { readEmoji } from '@common/server';
import { THREAD_TYPE } from '@common/constants/thread-post';
import { debounce } from '@common/utils/throttle-debounce';
import { toTCaptcha } from '@common/utils/to-tcaptcha';
import Emoji from '@components/emoji';
import styles from './index.module.scss';
import ImageUpload from '../image-upload';

const InputPop = (props) => {
  const { mark, visible, onSubmit, onClose, initValue, inputText = '写评论...', site, thread, checkUser = [] } = props;

  const captchaMark = `${mark}：${thread?.threadData?.id}`;
  const textareaRef = createRef();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const [emojis, setEmojis] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [showAt, setShowAt] = useState(false);
  const [showPicture, setShowPicture] = useState(false);
  const [imageList, setImageList] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [bottomHeight, setBottomHeight] = useState(0);
  const [isDisabled, setDisabled] = useState(true)
  const [focus, setFocus] = useState(true);
  // 验证码票据、字符串
  const [ticket, setTicket] = useState('');
  const [randstr, setRandStr] = useState('');

  // 输入框光标位置
  const [cursorPos, setCursorPos] = useState(0);
  const onChange = (e) => {
    setCursorPos(e.target.cursor || 0);
  };

  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  useEffect(() => {
    setFocus(true)
    if (props.showEmojis) {
      setFocus(false);
      setShowEmojis(props.showEmojis);
    }
    // 请求表情地址
    async function fetchEmojis() {
      if (!emojis?.length) {
        const ret = await readEmoji();
        const { code, data = [] } = ret;
        if (code === 0) {
          setEmojis(data.map(item => ({ code: item.code, url: item.url })));
        }
      }
    }
    fetchEmojis()
  }, [props.showEmojis]);

  useEffect(() => {
    setFocus(true)
    if (props.showPicture) {
      setFocus(false);
      setShowPicture(props.showPicture);
    }
  }, [props.showPicture]);

  useEffect(() => {
    Taro.eventCenter.on('captchaResult', handleCaptchaResult);
    Taro.eventCenter.on('closeChaReault', handleCloseChaReault);

    return () => {
      Taro.eventCenter.off('captchaResult', handleCaptchaResult);
      Taro.eventCenter.off('closeChaReault', handleCloseChaReault);
    };
  }, []);

  useEffect(() => {
    if (ticket && randstr && props.comment.captchaMark === captchaMark) {
      onSubmitClick(true);
      props.comment.setCaptchaMark('post');
    }
  }, [ticket, randstr])

  const handleCaptchaResult = (result) => {
    setTicket(result.ticket);
    setRandStr(result.randstr);
  };

  const handleCloseChaReault = () => {
    setTicket('');
    setRandStr('');
  };

  const checkSubmit = async () => {
    const valuestr = value.replace(/\s/g, '');
    // 如果内部为空，且只包含空格或空行
    if (!valuestr && imageList.length === 0) {
      Toast.info({ content: '请输入内容' });
      return false;
    }


    const { webConfig } = props.site;
    if (webConfig) {
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      const qcloudCaptchaAppId = webConfig?.qcloud?.qcloudCaptchaAppId;
      const createThreadWithCaptcha = webConfig?.other?.createThreadWithCaptcha;
      if (qcloudCaptcha && createThreadWithCaptcha) {
        if (!ticket || !randstr) {
          await props.comment.setPostContent({ value, imageList });
          toTCaptcha(qcloudCaptchaAppId);
          return false;
        }
      }
    }

    return true;
  }

  // 监听键盘的高度
  Taro.onKeyboardHeightChange((res) => {
    setBottomHeight((res?.height || 0) - (getBottomSafeArea() || 0));
  });

  // 获取底部安全距离
  const getBottomSafeArea = () => {
    const { screenHeight } = Taro.getSystemInfoSync();
    const { bottom } = Taro.getSystemInfoSync().safeArea;

    return screenHeight - bottom
  };

  // 点击发布
  const onSubmitClick = async (isCaptchaCallback = false) => {
    if (loading || imageUploading) return;
    if (typeof onSubmit !== 'function') return;
    if (!isCaptchaCallback) {
      if (!(await checkSubmit())) return;
    }

    const { postValue, postImageList, clearPostContent } = props.comment;
    try {
      setLoading(true);
      const data = {
        val: isCaptchaCallback ? postValue : value,
        imageList: isCaptchaCallback ? postImageList : imageList,
        captchaTicket: ticket,
        captchaRandStr: randstr,
      }
      const success = await onSubmit(data);
      if (success) {
        setTimeout(() => {
          setValue('');
        });
        setShowPicture(false);
        setShowEmojis(false);
        setImageList([]);
        setFocus(true);
        setDisabled(false);
        thread.setCheckUser([]);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      clearPostContent();
      handleCloseChaReault();
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

    textareaRef.current.blur();
    // setFocus(false);

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
    // setShowAt(!showAt);
    Taro.navigateTo({
      url: '/indexPages/thread/selectAt/index?type=thread',
    });
    setShowEmojis(false);
  };

  const onPcitureIconClick = () => {
    setShowPicture(!showPicture);
    setShowEmojis(false);
    setShowAt(false);
  };

  // 完成表情选择
  const onEmojiClick = (emoji) => {
    // 在光标位置插入
    const insertPosition = cursorPos || 0;
    const newValue = value.substr(0, insertPosition) + (emoji.code || '') + value.substr(insertPosition);
    setValue(newValue);
    setCursorPos(cursorPos + emoji.code.length);
    if (newValue.length > 0 && isDisabled) {
      setDisabled(false);
    }
    if (newValue.length === 0 && !isDisabled) {
      setDisabled(true);
    }
    // textareaRef.current.focus();
    // setFocus(true)

    // setShowEmojis(false);//fix:注释 修复 不能连续点击表情输入的问题
  };

  useEffect(() => {
    // 在光标位置插入
    const atListStr = checkUser.map((atUser) => ` @${atUser} `).join('');
    const insertPosition = cursorPos || 0;
    const newValue = value.substr(0, insertPosition) + (atListStr || '') + value.substr(insertPosition);
    setValue(newValue);
    if (textareaRef?.current) {
      textareaRef.current.focus();
      setFocus(true);
    }
    if (checkUser.length > 0 && isDisabled) {
      setDisabled(false);
    }
    if (checkUser.length === 0 && !isDisabled) {
      setDisabled(true);
    }
  }, [checkUser]);

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
        const arr = item.path.split('.').pop();
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
    const msg = ret?.Message;
    const code = ret?.Code === -7075 || ret?.code === -4002; // 错误码为-7075时为不允许上传敏感图
    Toast.error({
      content: code ? msg : '图片上传失败',
    });
  };

  const onClick = () => {
    typeof onCancel === 'function' && onCancel();
  };
  const handleChange = (e) => {
    onChange(e)
    setValue(e.target.value)
    if (e.target.value.length > 0 && isDisabled) {
      setDisabled(false);
    }
    if (e.target.value.length === 0 && !isDisabled && imageList.length === 0) {
      setDisabled(true);
    }
  };
  return visible ? (
    <View className={classnames(styles.body, visible && styles.show)}>
      <View className={styles.popup} onClick={onClick}>
        <View onClick={(e) => e.stopPropagation()}>
          <View className={styles.container}>
            <View className={styles.main}>
              {/* <ScrollView scrollY className={styles.valueScroll}> */}
              <CustomWrapper>
                <Textarea
                  className={styles.input}
                  maxLength={5000}
                  rows={4}
                  showLimit={false}
                  value={value}
                  onBlur={(e) => {
                    onChange(e);
                  }}
                  onChange={debounce((e) => {
                    handleChange(e)
                  }, 100)}
                  onClick={() => { setShowEmojis(false), textareaRef.current.focus(); }}
                  placeholder={inputText}
                  disabled={loading}
                  placeholderClass={styles.placeholder}
                  forwardedRef={textareaRef}
                  focus={focus}
                  fixed
                  adjustPosition={false}
                // autoHeight={false}
                ></Textarea>
              </CustomWrapper>
              {/* </ScrollView> */}

              {showPicture && (
                <Fragment>
                  <View className={styles.imageUpload}>
                    <ImageUpload
                      fileList={imageList}
                      onChange={handleUploadChange}
                      onComplete={onComplete}
                      beforeUpload={(cloneList, showFileList) =>
                        beforeUpload(cloneList, showFileList, THREAD_TYPE.image)
                      }
                      onFail={onFail}
                    />
                  </View>
                  <Divider className={styles.divider}></Divider>
                </Fragment>
              )}
            </View>

            <View className={styles.button}>
              <View className={styles.operates}>
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
              </View>
              <View
                className={classnames(styles.ok, (loading || imageUploading || isDisabled) && styles.disabled)}
                onClick={() => {
                  props.comment.setCaptchaMark(captchaMark);
                  onSubmitClick(false)
                }}
              >
                发布
              </View>
            </View>
          </View>

          {showEmojis && (
            <View className={styles.emojis}>
              <Emoji show={showEmojis} emojis={emojis} onClick={onEmojiClick} />
            </View>
          )}
          <View className={styles.keyboard} style={{ height: `${bottomHeight}px` }}></View>
          <View className={styles.safeArea}></View>
        </View>
      </View>
    </View>
  ) : (
    <View className={classnames(styles.body, visible && styles.show)}></View>
  );
};

InputPop.options = {
  addGlobalClass: true,
};

export default inject('comment')(observer(InputPop));
