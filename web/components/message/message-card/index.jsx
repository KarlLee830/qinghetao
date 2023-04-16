import React from 'react';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from '@discuzqsdk/design';
import UnreadRedDot from '@components/unread-red-dot';
import styles from './index.module.scss';

const MessageCard = (props) => {
  const { cardItems, onClick, site, type } = props;
  const { isPC } = site;
  if (isPC) {
    return (
      <div className={styles['pc-container']}>
        <div className={styles['container-inner']}>
          {cardItems.map(({ title, link }, idx) => (
            <div
              key={idx}
              className={classNames(styles.item, {
                [styles['item-active']]: link.includes(type)
              })}
              onClick={() => onClick(link)}
            >
              {title}
            </div>
          ))}
        </div>
      </div>
    )
  }
  return (
    <div className={styles.container}>
      {cardItems.map(({ iconName, title, link, unreadCount }, idx) => (
        <div key={idx} className={styles.item} onClick={() => onClick(link)}>
          <div className={styles.left}>
            <UnreadRedDot type='avatar' unreadCount={unreadCount}>
              <Icon name={iconName} className={styles.icon} size={20} />
            </UnreadRedDot>
          </div>
          <div className={styles.center}>{title}</div>
          <div className={styles.arrow}>
            <Icon className={styles.right} name={'RightOutlined'} size={10} />
          </div>
        </div>
      ))}
    </div>
  );

};

MessageCard.propTypes = {
  cardItems: PropTypes.array.isRequired,
  onClick: PropTypes.func.isRequired,
};

// 设置props默认类型
MessageCard.defaultProps = {
  cardItems: [],
  onClick: () => { },
};

//  MessageCard;
export default inject('site')(observer(MessageCard));
