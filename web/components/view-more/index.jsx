import React from 'react';
import stylesModule from './index.module.scss';
import { Icon } from '@discuzqsdk/design';
import classnames from 'classnames';

function ViewMore(props) {
  const { className, styles, onClick } = props;

  return (
    <div className={classnames(stylesModule.loadMore, className)} onClick={onClick} styles={styles}>
      查看更多
      <Icon name="RightOutlined" className={stylesModule.icon} size={12} />
    </div>
  );
}

export default ViewMore;
