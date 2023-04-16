import React from 'react';
import { RichText, Icon } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './index.module.scss';

const IframeVideoDisplay = ({
  content,
  whiteList = ['bilibili', 'youku', 'iqiyi', 'music.163.com', 'qq.com', 'em.iq.com', 'xigua', 'myqcloud.com'],
  isDeleteShow = false,
  threadPost,
  h5,
}) => {
  const videoWrapperRef = React.createRef(null);
  const [toolbarWidth, setToolbarWidth] = React.useState('100%');

  const contentDom = (
    <RichText
      className={styles.richtext}
      content={content}
      iframeWhiteList={whiteList}
      onClick={() => { }}
      onImgClick={() => { }}
      onLinkClick={() => { }}
      transformer={parseDom => parseDom}
    />
  );

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if (videoWrapperRef.current) {
        const iframeVideoRef = videoWrapperRef.current.querySelector('iframe');
        const { width } = iframeVideoRef;
        setToolbarWidth(`${width}px`);
      }
    }
  }, []);

  if (!isDeleteShow) return contentDom;
  const styl = h5 ? styles.h5 : styles.pc;

  return (
    <div ref={videoWrapperRef} id="dzq-post-video" className={classNames(styles.wrapper, styl)}>
      {contentDom}
      <div className={styles.wrapper__delete} onClick={() => threadPost.setPostData({ iframe: {} })} style={{
        width: toolbarWidth,
      }}>
        <Icon name="DeleteOutlined" />
      </div>
    </div>
  );
};

export default inject('threadPost')(observer(IframeVideoDisplay));
