import React, { createRef, useEffect, useState, useCallback, useMemo } from 'react';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import { View, CustomWrapper } from '@tarojs/components'
import Input from '@discuzqsdk/design/dist/components/input';
import Button from '@discuzqsdk/design/dist/components/button';
import Icon from '@discuzqsdk/design/dist/components/icon';
import { readEmoji } from '@common/server';
import Avatar from '@components/avatar';
import Emoji from '@components/emoji';
import { debounce } from '@common/utils/throttle-debounce.js';
import { toTCaptcha } from '@common/utils/to-tcaptcha';
import classnames from 'classnames';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';

const CommentInput = (props) => {
  const { mark, threadId, onSubmit, initValue = '', placeholder = '写下我的评论...', userInfo, emojihide } = props;
  const captchaMark = `${mark}：${threadId}`;

  const textareaRef = createRef();

  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const [placeholderState, setPlaceholder] = useState('');

  const [emojis, setEmojis] = useState([]);
  const [showEmojis, setShowEmojis] = useState(false);

  const [cursorPos, setCursorPos] = useState(0);

  // 验证码票据、字符串
  const [ticket, setTicket] = useState('');
  const [randstr, setRandStr] = useState('');

  const canSubmit = useMemo(() => !!value, [value]);

  useEffect(() => {
    setPlaceholder(placeholder);
  }, [placeholder]);

  useEffect(() => {
    setValue(initValue);
  }, [initValue]);

  useEffect(() => {
    if (emojihide) setShowEmojis(false);
  }, [emojihide]);

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
    if (!valuestr) {
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
          await props.comment.setPostContent({ value, imageList: [] });
          toTCaptcha(qcloudCaptchaAppId);
          return false;
        }
      }
    }

    return true;
  }

  const onSubmitClick = async (isCaptchaCallback = false) => {
    if (loading) return;
    if (typeof onSubmit !== 'function') return;
    if (!isCaptchaCallback) {
      if (!(await checkSubmit())) return;
    }

    const { postValue, clearPostContent } = props.comment;
    try {
      setLoading(true);
      const data = {
        val: isCaptchaCallback ? postValue : value,
        captchaTicket: ticket,
        captchaRandStr: randstr,
      }
      const success = await onSubmit(data);
      if (success) {
        setValue('');
      }
    } catch (error) {
      console.log(error);
    } finally {
      // 发布成功隐藏表情
      setShowEmojis(false);
      setLoading(false);
      clearPostContent();
      handleCloseChaReault();
    }
  };

  const onEmojiIconClick = async () => {
    if (typeof props.onEmojiIconClick === 'function' && !props.onEmojiIconClick()) {
      return;
    }

    setShowEmojis(!showEmojis);

    // 请求表情地址
    if (!emojis?.length) {
      const ret = await readEmoji();
      const { code, data = [] } = ret;
      if (code === 0) {
        setEmojis(data.map((item) => ({ code: item.code, url: item.url })));
      }
    }
  };

  // 完成选择表情
  const onEmojiClick = (emoji) => {
    const newValue = value.substr(0, cursorPos) + (emoji.code || '') + value.substr(cursorPos);
    setValue(newValue);
    setCursorPos(cursorPos + emoji.code.length);
  };

  const onFocus = (e) => {
    typeof props.onFocus === 'function' && props.onFocus(e);
  };

  const onBlur = (e) => {
    setCursorPos(e.detail.cursor)
  }

  return (
    <View className={styles.container}>
      <View className={styles.main}>
        <Avatar
          userId={userInfo?.id}
          circle={true}
          image={userInfo?.avatarUrl}
          name={userInfo?.nickname || ''}
          onClick={(e) => props.onClick && props.onClick(e)}
        ></Avatar>
        <View className={styles.customWrapper}>
          <CustomWrapper >
            <Input
              className={`${styles.input}`}
              maxLength={5000}
              showLimit={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={placeholderState}
              disabled={loading}
              ref={textareaRef}
              onFocus={onFocus}
              onBlur={onBlur}
            ></Input>
          </CustomWrapper>
        </View>
      </View>


      <View className={styles.footer}>
        {showEmojis && <View className={styles.emojis}><Emoji show={showEmojis} emojis={emojis} onClick={onEmojiClick} /></View>}

        <View className={styles.linkBtn}>
          <Icon
            name="SmilingFaceOutlined"
            size="20"
            className={classnames(styles.btnIcon, showEmojis && styles.actived)}
            onClick={onEmojiIconClick}
            id="emojiBtn"
          ></Icon>
        </View>

        <Button
          loading={loading}
          disabled={!canSubmit}
          onClick={() => {
            props.comment.setCaptchaMark(captchaMark);
            onSubmitClick(false)
          }}
          className={styles.button}
          type="primary"
          size="large"
        >
          评论
        </Button>
      </View>
    </View>
  );
};

export default inject('comment', 'user', 'site')(observer(CommentInput));
