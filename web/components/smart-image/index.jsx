import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import isServer from '@common/utils/is-server';
import styles from './index.module.scss';
import { isLongImage } from '@common/utils/calc-image-type';
import calcCosImageQuality from '@common/utils/calc-cos-image-quality';
import { inject, observer } from 'mobx-react';

const SmartImg = ({ level, type, src, onClick, noSmart = false, showLongPicture = true, postLoad = '', size = 0 }) => {
  const [isLong, changeIsLong] = useState(false);
  const img = useRef(null);

  const imgSrc = useMemo(() => {
    if (!src) return '';
    if (size / 1024 / 1024 > 2) return calcCosImageQuality(src, type, 100);
    if (noSmart) return calcCosImageQuality(src, type, 0);
    return calcCosImageQuality(src, type, level);
  }, [noSmart, src, type, level]);

  const imgOnload = useCallback(() => {
    if (typeof postLoad === 'function') {
      postLoad();
    }
    if (img && img.current) {
      const width = img.current.naturalWidth;
      const height = img.current.naturalHeight;
      changeIsLong(isLongImage(width, height));
    }
    if (!showLongPicture) {
      changeIsLong(false);
    }
  }, [img]);
  return (
        <div className={styles.box}>
            <img  alt="图片" ref={img} src={imgSrc} onLoad={imgOnload} onClick={onClick}/>
            {!noSmart && isLong && <div className={styles.longImgBox}><p className={styles.longImgText}>长图</p></div>}
        </div>
  );
};

export default inject('card')(observer(SmartImg));
