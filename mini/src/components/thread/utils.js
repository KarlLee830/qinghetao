import { createContext } from 'react';
import Taro from '@tarojs/taro';

//URL正则
const urlReg = /^(((ht|f)tps?):\/\/)?[\w-]+(\.[\w-]+)+([\w.,@?^=%&:/~+#-]*[\w@?^=%&/~+#-])?$/

export const ThreadCommonContext = createContext();

export const noop = () => {};

// 过滤点击事件
export const filterClickClassName = (dom) => {
  const blacklistClass = ['dzq-popup', 'dzq-audio', 'dzq-avatar', 'dzq-tabs', 'dzq-icon', 'disable-click'];
  const blacklistHTML = ['img'];
  // const whitelist = [];
  const { className = '', localName = '' } = dom;
  const blacklistFilter = blacklistClass.filter((item) => className.indexOf(item) !== -1);
  if (blacklistFilter.length && blacklistHTML.indexOf(localName) !== -1) {
    // TODO 点击头像暂时跳转帖子详情
    return true;
  }
  if (blacklistFilter.length || blacklistHTML.indexOf(localName) !== -1) {
    return false;
  }
  return true;
};

export const debounce = (func, wait) => {
  let timeout;
  return () => {
    const context = this;
    const args = [...arguments];
    if (timeout) clearTimeout(timeout);
    const callNow = !timeout;
    timeout = setTimeout(() => {
      timeout = null;
    }, wait);
    if (callNow) func.apply(context, args);
  };
};

// 处理附件的数据
export const handleAttachmentData = (data) => {
  const newData = { text: data?.text || '', plugin: {} };
  const values = Object.values(data?.indexes || {});
  values.forEach((item) => {
    let { tomId, threadId } = item;
    // 防止后台返回的字段类型不对
    tomId = `${tomId}`;
    if (tomId === '101') {
      // 图片
      newData.imageData = item.body;
    } else if (tomId === '102') {
      // 音频
      newData.audioData = item.body;
    } else if (tomId === '103') {
      // 视频
      newData.videoData = item.body;
    } else if (tomId === '104') {
      // 商品
      newData.goodsData = item.body;
    } else if (tomId === '105') {
      // 问答
      newData.qaData = item.body;
    } else if (tomId === '106') {
      // 红包
      newData.redPacketData = item.body;
    } else if (tomId === '107') {
      // 悬赏
      newData.rewardData = item.body;
    } else if (tomId === '108') {
      // 附件
      newData.fileData = item.body;
    } else if (tomId === '109') { // 投票
      newData.voteData = item.body;
    // 插件
    } else if (tomId === '10002') { // iframe外插视频
      newData.iframeData = item.body;
    } else {
      const { tomId, body, _plugin = {} } = item;
      if ( _plugin ) {
        newData.plugin[_plugin?.name] = {
          tomId,
          body,
          _plugin,
        };
      }
    }
    newData.threadId = threadId;
  });
  return newData;
};

export const extensionList = [
  '7Z',
  'AI',
  'APK',
  'CAD',
  'CDR',
  'DOC',
  'DOCX',
  'EPS',
  'EXE',
  'IPA',
  'MP3',
  'MP4',
  'PDF',
  'PPT',
  'PSD',
  'RAR',
  'TXT',
  'XLS',
  'XLSX',
  'ZIP',
  'JPG',
  'WAV',
];

export const isPromise = (obj) => {
  return !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';
};

/* dispatch 类型常量 */
export const ON_LIKE = 'ON_LIKE'; // 点赞事件
export const ON_SHARE = 'ON_LIKE'; // 分享事件
export const ON_COMMENT = 'ON_COMMENT'; // 评论事件
export const ON_PAY_VIDEO = 'ON_PAY_VIDEO'; // 视频付费事件
export const ON_PAY_AUDIO = 'ON_PAY_AUDIO'; // 音频付费事件
export const ON_PAY_REWARD = 'ON_PAY_REWARD'; // 悬赏付费事件
export const ON_PAY_ATTACHMENT = 'ON_PAY_ATTACHMENT'; // 附件付费事件
export const ON_PAY_CONTENT = 'ON_PAY_CONTENT'; // 文字付费事件
export const ON_PAY_IMAGE = 'ON_PAY_IMAGE'; // 图片付费事件

export const toFixed = (number = 0) => 0.01 * Math.floor(100 * number);

// 随机数，获取当前canvas id
export const randomStr = (len = 16) => {
  const string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const l = string.length;
  let str = '';
  for (let i = 0; i < len; i++) {
    const index = Math.floor((Math.random() * 100 * l) % l);
    str += string[index];
  }
  return str;
};

export const getElementRect = async (eleId = '', delay = 200) =>
  new Promise((resovle, reject) => {
    const t = setTimeout(() => {
      clearTimeout(t);

      Taro.createSelectorQuery()
        .select(`#${eleId}`)
        .boundingClientRect((rect) => {
          if (rect) {
            resovle(rect);
          } else {
            // reject('获取不到元素');
            resovle({ width: 378 });
          }
        })
        .exec();
    }, delay);
  });

export const handleLink = (node) => {
  const href = node?.attribs?.href || node?.attribs?.src;
  if (href) {
    // 处理外部链接
    const isExternaLink = urlReg.test(href);
    if (isExternaLink) {
      Taro.setClipboardData({
        data: href,
      });
      return { url: '', isExternaLink: true };
    }

    const urls = href.split('/');
    // let url = '/subPages';
    let url = urls[1]==='user'?'/userPages':'/subPages';
    urls
      ?.filter((item) => item)
      .forEach((item, index, arr) => {
        if (index !== arr.length - 1) {
          url += `/${item}`;
        } else {
          url += `/index?id=${item}`;
        }
      });

    return { url };
  }

  return { url: '' };
};
