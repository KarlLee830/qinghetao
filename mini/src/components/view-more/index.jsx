import React from 'react';
import Icon from '@discuzqsdk/design/dist/components/icon';
import { View } from '@tarojs/components'
import classnames from 'classnames';
import stylesModule from './index.module.scss';

function ViewMore(props) {
  const { className, styles, onClick } = props;

  return (
    <View className={classnames(stylesModule.loadMore, className)} onClick={onClick} styles={styles}>
      查看更多
      <Icon name="RightOutlined" className={stylesModule.icon} size={12} />
    </View>
  );
}

export default ViewMore;
