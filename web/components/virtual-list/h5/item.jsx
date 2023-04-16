import React, { useEffect, useRef } from 'react';
import ThreadContent from '@components/thread';
import { observer } from 'mobx-react';

export default observer((props) => {
  const { data, isLast, canPublish = () => { } } = props;

  const ref = useRef(null);

  useEffect(() => {
    measure();
  }, [ref?.current?.clientHeight]);

  const measure = () => {
    try {
      typeof props.measure === 'function' && props.measure();
    } catch (error) {
      // console.log(error);
    }
  };

  const recomputeRowHeights = (data) => {
    props.recomputeRowHeights(data);
    measure();
  };

  const callback = () => {
    measure && measure();
  };

  useEffect(() => {
    if (ref.current) {
      const config = { attributes: true, childList: true, subtree: true };

      try {
        const observer = new MutationObserver(callback);
        observer.observe(ref.current, config);
        return () => {
          observer.disconnect();
        };
      } catch (error) {
        // console.log(error);
      }
    }
  }, [ref]);

  return (
    <div ref={ref}>
      <ThreadContent
        onContentHeightChange={measure}
        onImageReady={measure}
        onVideoReady={measure}
        key={data.threadId}
        showBottomStyle={!isLast}
        data={data}
        // className={styles.listItem}
        recomputeRowHeights={(data) => recomputeRowHeights(data)}
        enableCommentList={props.enableCommentList}
        canPublish={canPublish}
      />
    </div>
  );
});
