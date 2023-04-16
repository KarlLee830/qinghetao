/**
 * 编辑器
 * 基于 vditor 开源组件：https://github.com/Vanessa219/vditor
 */
import React, { useState, useEffect, useRef } from 'react';
import Vditor from '@discuzqsdk/vditor';
import classNames from 'classnames';
import { baseOptions, baseToolbar } from './options';
import { MAX_COUNT } from '@common/constants/thread-post';
import LoadingBox from '@components/loading-box';
import { emojiVditorCompatibilityDisplay } from '@common/utils/emoji-regexp';
import './index.scss';
import '@discuzqsdk/vditor/src/assets/scss/index.scss';
import { Toast } from '@discuzqsdk/design';
import browser, { constants } from '@common/utils/browser';
import commonUpload from '@common/utils/common-upload';
import { inject, observer } from 'mobx-react';
import isServer from '@common/utils/is-server';
import xss from 'xss';

function DVditor(props) {
  const {
    pc,
    emoji = {},
    atList = [],
    topic,
    value = '',
    isResetContentText,
    onChange = () => {},
    onFocus = () => {},
    onBlur = () => {},
    onInit = () => {},
    onInput = () => {},
    setState = () => {},
    onCountChange = () => {},
    hintCustom = () => {},
    hintHide = () => {},
    site = {},
    plugin,
  } = props;


  const vditorId = 'dzq-vditor';
  let timeoutId = null;

  const [isFocus, setIsFocus] = useState(false);
  const [vditor, setVditor] = useState(null);

  const isEmojiInsert = useRef(null);

  const html2mdSetValue = (text) => {
    try {
      if (!vditor) return '';
      const md = !text ? '' : vditor.html2md(text);
      vditor.setValue && vditor.setValue(md);
    } catch (error) {
      console.error('html2mdSetValue', error);
    }
  };

  const html2mdInserValue = (text, isImage) => {
    try {
      if (!vditor && !window.vditorInstance) return;
      const editorInstance = vditor || window.vditorInstance;
      let md = editorInstance.html2md && editorInstance.html2md(text);
      md = md.substr(0, md.length - 1);

      if (isImage) {
        md = `<p>${md}</p>`;
      }

      editorInstance.insertValue && editorInstance.insertValue(md);
    } catch (error) {
      console.error('html2mdInserValue', error);
    }
  };

  useEffect(() => {
    if (!vditor) initVditor();
    // return () => {
    //   try {
    //     if (vditor && vditor.destroy) vditor.destroy();
    //   } catch (error) {
    //     console.log(error);
    //   }
    // };
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    if (emoji && emoji.code) {
      isEmojiInsert.current = true;
      setState({ emoji: {} });
      // 因为vditor的lute中有一些emoji表情和 emoji.code 重叠了。这里直接先这样处理
      let value = `<img alt="${emoji.code}dzqemoji" src="${emoji.url}" class="qq-emotion" />`;
      value = emojiVditorCompatibilityDisplay(value);
      // setCursorPosition();
      html2mdInserValue(value);
      // 解决安卓表情多次连续点击导致键盘弹起问题
      if (browser.env(constants.ANDROID)) {
        if (!pc && getSelection().rangeCount > 0) getSelection().removeAllRanges();
      }

      if (browser.env(constants.IOS)) {
        getSelection().removeAllRanges();
      }

      if (typeof window !== 'undefined') {
        if (browser.env(constants.IOS)) {
          document.activeElement.blur();
        }
      }

      if (!vditor && !window.vditorInstance) return;
    }
  }, [emoji]);

  useEffect(() => {
    if (atList && !atList.length) return;
    const users = atList.map((item) => {
      if (item) return ` @${item} &nbsp; `;
      return '';
    });
    setState({ atList: [] });
    if (users.length) {
      // setCursorPosition();
      vditor.insertValue && vditor.insertValue(users.join(''));
      props.threadPost.setEditorHintAtKey('');
    }
  }, [atList]);

  useEffect(() => {
    if (topic) {
      setState({ topic: '' });
      // setCursorPosition();
      vditor.insertValue && vditor.insertValue(` ${topic} &nbsp; `);
      props.threadPost.setEditorHintTopicKey('');
    }
  }, [topic]);

  // useEffect(() => {
  //   onCountChange(contentCount);
  // }, [contentCount]);

  // 设置编辑器初始值，主要是针对编辑帖子
  let errorNum = 0;
  const setEditorInitValue = () => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      try {
        // 重置编辑器的值
        if (isResetContentText && value) {
          errorNum = 0;
          html2mdSetValue(value);
          return;
        }
        if (!value || (vditor && vditor.getValue && vditor.getValue() !== '\n')) {
          errorNum = 0;
          return;
        }
        if (vditor && vditor.getValue && vditor.getValue() === '\n' && vditor.getValue() !== value) {
          errorNum = 0;
          html2mdSetValue(value);
        }
      } catch (error) {
        console.log(error);
        errorNum += 1;
        if (errorNum <= 5) setEditorInitValue();
      }
    }, 300);
  };

  useEffect(() => {
    setEditorInitValue();
  }, [value, vditor]);

  useEffect(() => {
    if (!isServer()) {
      if (isEmojiInsert.current === true) {
        isEmojiInsert.current = false;
      } else {
        window.vditorInstance.focus();
      }
    }
  }, [value, vditor]);

  const bubbleBarHidden = () => {
    const timer = setTimeout(() => {
      clearTimeout(timer);
      setIsFocus(false);
      onBlur();
    }, 100);
  };

  const isHaveContent = () => {
    const { postData } = props.threadPost;
    const { images, video, files, audio, vote } = postData;
    if (
      !(
        postData.contentText
        || video.id
        || vote.voteTitle
        || audio.id
        || Object.values(images).length
        || Object.values(files).length
      )
    ) {
      return false;
    }
    return true;
  };

  const getEditorRange = (vditor) => {
    /**
     * copy from vditor/src/ts/util/selection.ts
     **/
    let range;
    const { element } = vditor[vditor.currentMode];
    if (getSelection().rangeCount > 0) {
      range = getSelection().getRangeAt(0);
      if (element.isEqualNode(range.startContainer) || element.contains(range.startContainer)) {
        return range;
      }
    }
    if (vditor[vditor.currentMode].range) {
      return vditor[vditor.currentMode].range;
    }
    element.focus();
    range = element.ownerDocument.createRange();
    range.setStart(element, 0);
    range.collapse(true);
    return range;
  };

  const storeLastCursorPosition = (editor) => {
    const { vditor } = editor;
    const editorElement = vditor[vditor.currentMode]?.element;
    editorElement?.addEventListener('click', (e) => {
      setIsFocus(false);
      onFocus('focus', e);
    });
    /** *
     * ios 和mac safari，在每一个事件中都记住上次光标的位置
     * 避免blur后vditor.insertValue的位置不正确
     * **/

    if (/Chrome/i.test(navigator.userAgent) || !/(iPhone|Safari|Mac OS)/i.test(navigator.userAgent)) return;

    // todo 事件需要throttle或者debounce??? delay时间控制不好可能导致记录不准确
    // const editorElement = vditor[vditor.currentMode]?.element;
    // // // todo 需要添加drag事件吗
    // const events = ['mouseup', 'click', 'keyup', 'touchend', 'touchcancel', 'input'];
    // events.forEach((event) => {
    //   editorElement?.addEventListener(event, () => {
    //     setTimeout(() => {
    //       vditor[vditor.currentMode].range = getEditorRange(vditor);
    //       console.log(vditor[vditor.currentMode].range);
    //     }, 0);
    //   });
    // });
    // 从事件绑定方式修改成轮询记录的方式，以达到更实时更精确的记录方式，可解决iphone下输入中文光标会被重置到位置0的问题（性能需关注）
    const timeoutRecord = () => {
      timeoutId = setTimeout(() => {
        vditor[vditor.currentMode].range = getEditorRange(vditor);
        timeoutRecord();
      }, 200);
    };
    timeoutRecord();
  };

  const getLineHeight = (editor, textareaPosition, type) => {
    const postInner = document.querySelector('#post-inner');
    const { width, height } = postInner.getBoundingClientRect();
    const { vditor } = editor;
    const editorElement = vditor[vditor.currentMode].element;
    const x =      textareaPosition.left + (vditor.options.outline.position === 'left' ? vditor.outline.element.offsetWidth : 0);
    const y = textareaPosition.top;
    const lineHeight = parseInt(
      document.defaultView.getComputedStyle(editorElement, null).getPropertyValue('line-height'),
      10,
    );
    let left = `${x}px`;
    let right = 'auto';
    if ((type === '@' && x + 300 > width) || (type === '#' && x + 404 > width)) {
      right = '0px';
      left = 'auto';
    }
    const yy = y - postInner.scrollTop;
    let top = `${yy + (lineHeight || 22) + 16}px`;
    let bottom = 'auto';
    if ((type === '@' && height - yy < 150) || (type === '#' && height - yy < 190)) {
      top = 'auto';
      bottom = `${height - yy + (lineHeight || 22) + 40}px`;
    }

    return {
      top,
      bottom,
      left,
      right,
    };
  };

  const initVditor = () => {
    const htmlEncode = (text) => {
      const encodedStr = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/ /g, '&nbsp;');

      return encodedStr;
    };

    // https://ld246.com/article/1549638745630#options
	// https://dl.discuz.chat/discuzq-fe/static/lute/lute.min.js dl.依赖
    const editor = new Vditor(vditorId, {
      _lutePath: '/js/lute.min.js',
      ...baseOptions,
      minHeight: pc && !isHaveContent() ? 450 : 44,
      // 编辑器初始化值
      tab: '  ',
      value: xss(value),
      // 编辑器异步渲染完成后的回调方法
      after: () => {
        onInit(editor);
        editor.vditor.lute.SetJSRenderers({
          renderers: {
            Md2HTML: {
              renderBackslashContent: (node, entering) => {
                if (entering) {
                  if (node.TokensStr() !== '#') {
                    return [htmlEncode(node.TokensStr()), Lute.WalkContinue];
                  }
                  // 特殊处理 #
                  return [`\\${node.TokensStr()}`, Lute.WalkContinue];
                }

                return ['', Lute.WalkContinue];
              },
            },
          },
        });
        editor.setValue('');
        setEditorInitValue();
        editor.focus();
      },
      focus: (val, e) => {
        if (browser.env(constants.ANDROID)) onFocus('edior-focus', e);
      },
      input: () => {
        setIsFocus(false);
        onInput(editor);
        onChange(editor);
      },
      blur: () => {
        // 防止粘贴数据时没有更新内容
        onChange(editor);
        // 兼容Android的操作栏渲染
        bubbleBarHidden();
      },
      // 编辑器中选中文字后触发，PC才有效果
      select: (value) => {
        if (value) {
          onFocus('select');
          setIsFocus(true);
        } else bubbleBarHidden();
      },
      outline: {
        enable: false,
      },
      counter: {
        enable: true,
        after(count) {
          onCountChange(count);
          if (count >= MAX_COUNT) {
            Toast.info({ content: `最多输入${MAX_COUNT}字` });
          }
        },
        type: 'text',
        max: MAX_COUNT,
      },
      toolbarConfig: {
        hide: !!pc,
        pin: true,
        bubbleHide: false,
      },
      bubbleToolbar: pc ? [...baseToolbar] : [],
      // icon: '',
      preview: {
        theme: {
          current: '',
        },
      },
      hint: {
        extend: pc
          ? [
            {
              key: '@',
              hintCustom: (key, textareaPosition, lastindex) => {
                if (key.indexOf(' ') !== -1) {
                  return;
                }
                props.threadPost.setEditorHintAtKey(key);
                const position = getLineHeight(editor, textareaPosition, '@');
                hintCustom('@', key, position, lastindex, editor.vditor);
              },
            },
            {
              key: '#',
              hintCustom: (key, textareaPosition, lastindex) => {
                props.threadPost.setEditorHintTopicKey(key);
                const position = getLineHeight(editor, textareaPosition, '#');
                hintCustom('#', key, position, lastindex, editor.vditor);
              },
            },
          ]
          : [],
        hide() {
          props.threadPost.setEditorHintAtKey('');
          props.threadPost.setEditorHintTopicKey('');
          hintHide();
        },
      },
      upload: {
        url: 'upload',
        accept: 'image/*',
        handler: async (files) => {
          const {
            webConfig: { other, setAttach, qcloud },
          } = site;
          const { canInsertThreadImage } = other;
          const { supportImgExt, supportMaxSize } = setAttach;
          const { qcloudCosBucketName, qcloudCosBucketArea, qcloudCosSignUrl, qcloudCos } = qcloud;

          let photoMaxSize = supportMaxSize;
          if (qcloudCos) {
            photoMaxSize = supportMaxSize > 15 ? 15 : supportMaxSize;
          }

          if (!canInsertThreadImage) {
            Toast.error({
              content: '您没有上传图片的权限',
              duration: 3000,
            });
            return;
          }

          // 检查文件类型，含有非图片文件则退出上传并提示用户
          for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const { name } = file;
            const nameType = name.split('.').pop()
              .toUpperCase();
            const fileType = file.type;

            if (!fileType.includes('image')) {
              Toast.error({
                content: '暂不支持拖拽/复制上传非图片文件',
                duration: 3000,
              });
              return;
            }

            const types = supportImgExt.toUpperCase().split(',');
            if (!types.includes(nameType)) {
              Toast.error({
                content: `仅支持上传格式为${supportImgExt}的图片，请重新选择`,
                duration: 3000,
              });
              return;
            }

            if (file.size > photoMaxSize * 1024 * 1024) {
              Toast.error({
                content: `仅支持上传小于${photoMaxSize}MB的图片，请重新选择`,
                duration: 3000,
              });
              return;
            }
          }

          // 检查文件数量，超出max数量则退出上传并提示用户
          if (window.vditorInstance) {
            const text = window.vditorInstance.getHTML();
            const images = text.match(/<img.*?\/>/g);

            const max = 100;
            if (images && images.length + files.length > max) {
              Toast.error({
                content: `图文混排最多支持插入${max}张图片，现在还可以插入${max - images.length}张`,
                duration: 3000,
              });
              return;
            }
          }

          // 执行上传
          const toastInstance = Toast.loading({
            content: '图片上传中...',
            hasMask: true,
            duration: 0,
          });
          const res = await commonUpload({
            files,
            type: 1,
            supportImgExt,
            supportMaxSize,
            qcloudCosBucketName,
            qcloudCosBucketArea,
            qcloudCosSignUrl,
            qcloudCos,
          });
          const error = [];
          res.forEach((ret) => {
            const { code, data = {} } = ret;
            if (code === 0) {
              const { url, id } = data;
              html2mdInserValue(`<img src="${url}" alt="attachmentId-${id}" />`, true);
            } else {
              error.push(ret);
            }
          });
          toastInstance.destroy();
          if (error.length) {
            const errorLength = error.length;

            let content = `${errorLength}张图片上传失败，请重新尝试上传。`;

            const sensitiveLen = error.filter(item => item?.msg.includes('敏感图')).length;

            if (errorLength === sensitiveLen) {
              content = `有${sensitiveLen}张敏感图片上传失败，请更换图片重新上传。`;
            }

            if (errorLength > sensitiveLen && sensitiveLen) {
              content = `${error.length}张图片上传失败，其中有${sensitiveLen}张为敏感图，请处理后重新尝试上传。`;
            }

            Toast.info({
              content,
              duration: 2000,
            });
          }
        },
      },
    });

    storeLastCursorPosition(editor);
    setVditor(editor);
    window.vditorInstance = editor;
  };

  const className = pc ? 'dvditor pc' : classNames('dvditor h5', { 'no-focus': !pc && !isFocus });

  return (
    <>
      <div
        id={vditorId}
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          setState({ currentDefaultOperation: '' });
        }}
      >
        <LoadingBox>编辑器加载中...</LoadingBox>
      </div>
      {/* {!pc && isFocus && <div className="dvditor__placeholder"></div>} */}
    </>
  );
}

export default inject('threadPost', 'site', 'plugin')(observer(DVditor));
