import React from 'react';
import ActionSheet from '@discuzqsdk/design/dist/components/action-sheet/index';
import styles from './index.module.scss';

const OperationPop = (props) => {
  const { visible, onCancel, onOperationClick ,opContent} = props;
  const content =   opContent?.content;

  const onSelect = (e, item) => {
    typeof onOperationClick === 'function' && onOperationClick(item.key);
  }

  const actionsColumn = [
    {
      content: '回复',
      key: 'reply'
    },
    {
      content: '复制',
      key: 'copy',
      hide:(!content) || (content.indexOf('<span')>=0 && content.indexOf('@')>=0 ),   // 无文本或者@用户时不支持复制功能  todo:使用正则验证替换
    },
    {
      content: '举报',
      key: 'report'
    }];

  return (
    <ActionSheet
      className={styles.main}
      onSelect={(e, item) => onSelect(e, item)}
      visible={visible}
      actions={actionsColumn.filter(i=>!i.hide)}
      onClose={() => onCancel()}
    />
  );
};

export default OperationPop;
