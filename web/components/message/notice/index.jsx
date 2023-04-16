import React from 'react';
import { inject, observer } from 'mobx-react';
import H5Notice from './h5';
import PCNotice from './pc';

/**
 * 消息通知组件(h5 + PC)
 * @prop {Array} list 数据
 * @prop {string} type 消息类型
 * @prop {boolean} noMore 是否有更多数据
 * @prop {string} height 列表高度
 * @prop {boolean} withTopBar 消息页是否包含顶部导航
 * @prop {boolean} withBottomBar 消息页是否包含底部导航
 * @prop {object} topCard 列表顶部展示组件
 * @prop {function} onBtnClick 点击左滑操作按钮
*/

const Index = ({ site, ...props }) => {
  const { isPC } = site;
  return isPC ? <PCNotice {...props} /> : <H5Notice {...props} />
}

export default inject('site')(observer(Index));
