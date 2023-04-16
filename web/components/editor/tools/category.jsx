import React from 'react';
import styles from './index.module.scss';
import { Icon } from '@discuzqsdk/design';

class ToolsCategory extends React.Component {
  render() {
    const { onClick, categoryChoose } = this.props;
    const { parent, child } = categoryChoose;
    if (parent && !parent.pid) return null;
    return (
      <div className={styles['dzq-tools-category']} onClick={onClick}>
        <Icon name="MenuOutlined" size={14} />
        <span className={styles['dzq-tools-category__text']}>分类</span>
        <span className={styles['dzq-tools-category__tag']}>
          {parent.name || ''}{child.name && '\\'}{child.name || ''}
        </span>
      </div>
    );
  }
}

export default ToolsCategory;
