import React, { useEffect, useRef } from 'react';
import { observer } from 'mobx-react';

export default observer((props) => {
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
      {props.children}
    </div>
  );
});
