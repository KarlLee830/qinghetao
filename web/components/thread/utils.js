import { createContext } from 'react';


export const ThreadCommonContext = createContext();

export const noop = () => {};

// 过滤点击事件
export const filterClickClassName = (dom) => {
  const blacklistClass = ['dzq-popup', 'dzq-audio', 'dzq-avatar', 'dzq-tabs', 'dzq-icon', 'disable-click'];
  const blacklistHTML = ['img'];
  // const whitelist = [];
  const { className = '', localName = '' } = dom;
  const blacklistFilter = blacklistClass.filter(item => className.indexOf(item) !== -1);
  if (blacklistFilter.length && blacklistHTML.indexOf(localName) !== -1) { // TODO 点击头像暂时跳转帖子详情
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
}

// 处理附件的数据
export const handleAttachmentData = (data) => {
  const newData = { text: data?.text || '', plugin: {} };
  const values = Object.values(data?.indexes || {});
  values.forEach((item) => {
    let { tomId, threadId } = item;
    // 防止后台返回的字段类型不对
    tomId = `${tomId}`
    // 统一做一次字符串转换
    const conversionTomID = tomId ? '' + tomId : 'NULL';
    if (conversionTomID === '101') { // 图片
      newData.imageData = item.body;
    } else if (conversionTomID === '102') { // 音频
      newData.audioData = item.body;
    } else if (conversionTomID === '103') { // 视频
      newData.videoData = item.body;
    } else if (conversionTomID === '104') { // 商品
      newData.goodsData = item.body;
    } else if (conversionTomID === '105') { // 问答
      newData.qaData = item.body;
    } else if (conversionTomID === '106') { // 红包
      newData.redPacketData = item.body;
    } else if (conversionTomID === '107') { // 悬赏
      newData.rewardData = item.body;
    } else if (conversionTomID === '108') { // 附件
      newData.fileData = item.body;
    } else if (conversionTomID === '109') { // 投票
      newData.voteData = item.body;
    } else if (conversionTomID === '10002') { // iframe外插视频
      newData.iframeData = item.body;
    // 插件
    } else {
      const { tomId, body, _plugin = {} } = item;
      // const { _plugin } = body || {};
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
  'AI', 'APK',
  'CAD', 'CDR',
  'DOC', 'DOCX',
  'EPS', 'EXE', 'IPA',
  'MP3', 'MP4', 'PDF', 'PPT', 'PSD', 'RAR', 'TXT', 'XLS', 'XLSX', 'ZIP', 'JPG', 'WAV',
];

export const isPromise = obj => !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';

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
