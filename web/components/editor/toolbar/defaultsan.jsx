import React, { useState, useEffect } from 'react';
import { Icon, Dropdown, Button } from '@discuzqsdk/design';
import styles from './index.module.scss';
import { defaultIcon, defaultOperation } from '@common/constants/const';
import { THREAD_TYPE } from '@common/constants/thread-post';

export default function DefaultToolbar(props) {
  const { children, onClick, onSubmit, value, pc, permission } = props;
  const [currentAction, setCurrentAction] = useState('');

  useEffect(() => {
    if (!value) setCurrentAction(value);
  }, [value]);


  const emojiId = 'dzq-toolbar-emoji';
  const topicId = 'dzq-toolbar-topic';
  const atId = 'dzq-toolbar-at';
  function handleClick(e) {
    const emojiDom = document.querySelector(`#${emojiId}`);
    const topicDom = document.querySelector(`#${topicId}`);
    const atDom = document.querySelector(`#${atId}`);

    if ((emojiDom && emojiDom?.style?.display !== 'none')
      || (topicDom && topicDom?.style?.display !== 'none')
      || (atDom && atDom?.style?.display !== 'none')) {
      setCurrentAction('');
      onClick({ id: '' });
    }
  }

  useEffect(() => {
    window.document.body.addEventListener('click', handleClick);

    return () => {
      window.document.body.removeEventListener('click', handleClick);
    };
  }, []);

  const getIconCls = (item) => {
    const cls = styles['dvditor-toolbar__item'];
    const activeCls = `${styles['dvditor-toolbar__item']} ${styles.active}`;
    if (item.type === currentAction || item.id === currentAction) return activeCls;
    const { postData } = props;
    if (item.type === THREAD_TYPE.file && Object.values(postData?.files || []).length > 0) return activeCls;
    if (item.type === THREAD_TYPE.redPacket && postData?.redpacket?.price) return activeCls;
    if (item.type === THREAD_TYPE.paid && (postData?.price || postData?.attachmentPrice)) return activeCls;
    return cls;
  };

  const icons = (
    <>
      {defaultIcon.map((item) => {
        const clsName = getIconCls(item);
        const iconItem = permission[item.id] ? (
          <Icon key={item.name}
            onClick={(e) => {
              if (!item.menu) e.stopPropagation();
              if (item.id === currentAction) {
                // setCurrentAction('');
                if (!item.menu) onClick({ id: '' });
              } else {
                setCurrentAction(item.id);
                if (!(pc && item.menu)) onClick(item);
              }
            }}
            className={clsName}
            name={item.name}
            size="20">
          </Icon>
        ) : null;
        if (pc && item.menu) {
          const menus = (
            <Dropdown.Menu>
              {(item.menu.map(elem => (<Dropdown.Item key={elem.id} id={elem.name}>{elem.name}</Dropdown.Item>)))}
            </Dropdown.Menu>
          );
          return (
            <Dropdown
              key={item.id}
              trigger="hover"
              menu={menus}
              arrow={false}
              onChange={(key) => {
                setCurrentAction('');
                onClick(item, { id: key });
              }}
            >
              {iconItem}
            </Dropdown>
          );
        }
        return iconItem;
      })}
    </>
  );

  if (pc) return (
    <div className={`${styles['dvditor-toolbar']} ${styles.pc}`}>
      {icons}
      {children}
    </div>
  );

  return (
    <div className={styles['dvditor-toolbar']} id="dvditor-toolbar">
      <div className={styles['dvditor-toolbar__left']}>
        {icons}
      </div>
      <div className={styles['dvditor-toolbar__right']}
        onClick={() => {
          onSubmit();
          setCurrentAction('');
        }}
      >
        <Button type="primary" size="small">
          <Icon name="CheckOutlined" style={{ marginRight: '4px', fontSize: '8px' }} className={styles['kuqyou10']}></Icon> 
		  <div className={styles['kuqyou10']}>
		    发 布
		  </div>
		    
        </Button>
      </div>
      {/* 表情 */}
      {children}
    </div>
  );
}
