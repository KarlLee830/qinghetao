import React, { memo } from 'react';
import { Icon } from '@discuzqsdk/design';
import styles from './index.module.scss';

import PropTypes from 'prop-types';

function AttachmentCard({ item = {}, onClear }) {
  return (
    <div className={styles['attachment-item']}>
      <Icon className={styles.icon} name="EditQuestionOutlined" size={16} color="#8590A6" />
      <div className={styles.content}>
        <p className={styles.name}>{item.name}{item.id}</p>
        <span className={styles.size}>{item.size}</span>
      </div>
      <Icon
        className={styles.icon}
        name="CloseCircleOutlined"
        size={16}
        color="#8590A6"
        onClick={() => onClear(item.id)}
      />
    </div>
  );
}

const Attachment = (props) => {
  // state
  const { list = [], onAdd } = props;

  return (
    <div className={styles.wrapper}>
      {list.map((item) => (
        <div key={item.id}>
          <AttachmentCard item={item} {...props} />
        </div>
      ))}
      {list.length < 3 && (
        <div className={styles['add-box']} onClick={onAdd}>
          <Icon name="PlusOutlined" size={20} color="#8590A6" />
          添加附件
        </div>
      )}
    </div>
  );
};

Attachment.PropTypes = {
  list: PropTypes.array.isRequired,
  onClear: PropTypes.func, // 清除附件,传递附件id
  onAdd: PropTypes.func, // 添加附件，无负载
};

export default memo(Attachment);
