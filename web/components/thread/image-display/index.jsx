import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ImagePreviewer, Flex } from '@discuzqsdk/design';
import { noop } from '../utils';
import styles from './index.module.scss';
import SmartImg from '@components/smart-image';
import { calcImageType, calcImageDefaultType } from '@common/utils/calc-image-type';
const { Col, Row } = Flex;

// TODO 图片懒加载
const Index = ({ onClickMore: gotoDetail, imgData = [], flat = false, platform = 'h5', isPay = false, onPay = noop, onImageReady = noop, updateViewCount = noop, showLongPicture = true, postLoad = '' }) => {
  const [visible, setVisible] = useState(false);
  const [defaultImg, setDefaultImg] = useState('');
  const ImagePreviewerRef = React.useRef(null);
  const [firstImgData, setFirstImgData] = useState({ width: !Array.isArray(imgData) ? imgData[0]?.fileWidth || 0 : 0, height: !Array.isArray(imgData) ? imgData[0]?.fileHeight || 0 : 0 });

  const imagePreviewers = useMemo(() => imgData.filter(item => item?.needPay !== 1).map(item => item?.url), [imgData]);
  useEffect(() => {
    if (visible && ImagePreviewerRef && ImagePreviewerRef.current) {
      ImagePreviewerRef.current.show();
    }
  }, [visible]);


  // useEffect(() => {

  //   if (flat) return;

  //   let timer;
  //   if ( imgData && imgData.length !== 0 ) {
  //     const img = new Image();
  //     img.src = imgData[0].thumbUrl;
  //     // 超时处理
  //     timer = setTimeout(() => {
  //       if ( firstImgData === null ) {
  //         setFirstImgData('fail');
  //       }
  //     }, 2000);
  //     if (img.complete) {
  //       // 如果图片被缓存，则直接返回缓存数据
  //       if ( !img.naturalWidth || !img.naturalHeight  ) {
  //         setFirstImgData('fail');
  //       }
  //       setFirstImgData({
  //         width: img.naturalWidth,
  //         height: img.naturalHeight
  //       });
  //     } else {
  //         img.onload = function () {
  //           timer && clearTimeout(timer);
  //           if ( !img.naturalWidth || !img.naturalHeight  ) {
  //             setFirstImgData('fail');
  //           } else {
  //             setFirstImgData({
  //               width: img.naturalWidth,
  //               height: img.naturalHeight
  //             });
  //           }
  //         }
  //         img.onerror = function() {
  //           timer && clearTimeout(timer);
  //           setFirstImgData('fail');
  //         }
  //     }
  //   }
  //   return () => {
  //     timer && clearTimeout(timer);
  //   }
  // }, [flat, imgData]);

  // 当更新了firstImgData，代表确定了布局方式，可以通知外部更新
  // useEffect(() => {
  //   if (flat) return;
  //   onImageReady && onImageReady();
  // }, [flat, firstImgData]);

  const onClick = (item) => {
    const needPay = item.needPay === undefined ? isPay : item.needPay === 1;

    if (needPay) {
      onPay();
      return;
    }

    updateViewCount();
    imgData.forEach((i) => {
      if (i.id === item?.id) {
        setDefaultImg(i?.url);
        setVisible(true);
      }
    });
  };

  const onClickMore = (e) => {
    e.stopPropagation();
    if (imagePreviewers.length === 0 || imgData.slice(5).some(i => !!i?.needPay)) {
      onPay();
      return;
    }
    updateViewCount();
    setDefaultImg(imgData[4]?.url);
    setTimeout(() => {
      setVisible(true);
    }, 0);
  };

  const style = useMemo(() => {
    const num = imgData.length > 5 ? 5 : imgData?.length;
    return `containerNum${num}`;
  }, [imgData]);

  const handleImages = (flat) => {
    if (flat) {
      return { bigImages: imgData, smallImages: [] };
    }
    if (imgData.length < 3) {
      return { bigImages: imgData, smallImages: [] };
    }
    if (imgData.length < 5) {
      return { bigImages: [imgData[0]], smallImages: imgData.slice(1, imgData.length + 1) };
    }
    return { bigImages: [imgData[0], imgData[1]], smallImages: [imgData[2], imgData[3], imgData[4]] };
  };

  const ImageView = useMemo(() => {
    if (!imgData || imgData.length === 0) {
      return null;
    }
    if (!flat && firstImgData === null) return <div className={`${platform === 'h5' ? styles.placeholderH5 : styles.placeholderPC}`} />;
    const res = handleImages(flat);

    // 扁平处理
    if (flat) {
      return (
        <div>
          {res.bigImages.map((item, index) => (
            <div key={index} className={styles.flatItem}>
              <SmartImg
                postLoad={postLoad}
                noSmart
                type={item?.fileType}
                src={item?.url}
                onClick={() => onClick(item)}
                showLongPicture={showLongPicture} />
            </div>
          ))}
        </div>
      );
    }

    const type = firstImgData === 'fail' ? calcImageDefaultType(imgData.length) : calcImageType(firstImgData.width, firstImgData.height);

    if (imgData.length === 1) {
      return <One type={type} bigImages={res.bigImages} onClick={onClick} smallImages={res.smallImages} style={style} postLoad={postLoad} />;
    }
    if (imgData.length === 2) {
      return <Two type={type} bigImages={res.bigImages} onClick={onClick} smallImages={res.smallImages} style={style} postLoad={postLoad} />;
    }
    if (imgData.length === 3) {
      return <Three type={type} bigImages={res.bigImages} onClick={onClick} smallImages={res.smallImages} style={style} postLoad={postLoad} />;
    }
    if (imgData.length === 4) {
      return <Four type={type} bigImages={res.bigImages} onClick={onClick} smallImages={res.smallImages} style={style} postLoad={postLoad} />;
    }
    if (imgData.length >= 5) {
      return (
        <Five
          type={type}
          bigImages={res.bigImages}
          onClick={onClick}
          smallImages={res.smallImages}
          style={style}
          imgData={imgData}
          onClickMore={onClickMore}
        />
      );
    }
    return null;
  }, [imgData, firstImgData, flat]);

  return (
    <div onClick={gotoDetail} style={{ cursor: 'pointer' }} className={`${platform === 'h5' ? styles.container : styles.containerPC}`}>
      {ImageView}
      {visible && (
        <ImagePreviewer
          ref={ImagePreviewerRef}
          onClose={() => {
            setVisible(false);
          }}
          imgUrls={imagePreviewers}
          currentUrl={defaultImg}
        />
      )}
    </div>
  );
};

export default React.memo(Index);

const One = ({ type, bigImages, onClick, style, showLongPicture, postLoad }) => {
  const item = bigImages[0];
  return (
    <div className={`${styles[style]} ${styles[type]}`} onClick={e => e.stopPropagation()}>
      <SmartImg
        postLoad={postLoad}
        level={1}
        type={item?.fileType}
        src={item?.thumbUrl}
        size={item?.fileSize}
        onClick={() => onClick(item)}
        showLongPicture={showLongPicture} />
    </div>
  );
};

const Two = ({ type, bigImages, onClick, style, showLongPicture, postLoad }) => (
  <div onClick={e => e.stopPropagation()}>
    <Row gutter={4} className={`${styles[style]} ${styles[type]} ${styles.row}`}>
      {bigImages.map((item, index) => (
        <Col span={6} className={styles.col} key={index}>
          <SmartImg
            postLoad={postLoad}
            level={1}
            type={item?.fileType}
            src={item?.thumbUrl}
            size={item?.fileSize}
            onClick={() => onClick(item)}
            showLongPicture={showLongPicture} />
        </Col>
      ))}
    </Row>
  </div>
);

const Three = ({ type, bigImages, smallImages, onClick, style, showLongPicture, postLoad }) => {
  if (type === 'long' || type === 'longitudinal') {
    return (
      <div className={`${styles[style]} ${styles[type]}`} onClick={e => e.stopPropagation()}>
        <Row gutter={4}>
          <Col span={8} className={styles.col}>
            <SmartImg
              level={1}
              postLoad={postLoad}
              type={bigImages[0]?.fileType}
              src={bigImages[0]?.thumbUrl}
              onClick={() => onClick(bigImages[0])}
              size={bigImages[0]?.fileSize}
              showLongPicture={showLongPicture} />
          </Col>
          <Col span={4} className={styles.col}>
            <Row gutter={4} className={styles.smallRow}>
              {smallImages.map((item, index) => (
                <Col span={12} key={index} className={styles.smallCol}>
                  <SmartImg
                    postLoad={postLoad}
                    level={2}
                    type={item?.fileType}
                    size={item?.fileSize}
                    src={item?.thumbUrl}
                    onClick={() => onClick(item)}
                    showLongPicture={showLongPicture} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </div>

    );
  }
  return (
    <div className={`${styles[style]} ${styles[type]}`} onClick={e => e.stopPropagation()}>
      <div className={styles.bigImages}>
        <SmartImg
          postLoad={postLoad}
          level={1}
          type={bigImages[0]?.fileType}
          src={bigImages[0]?.thumbUrl}
          size={bigImages[0]?.fileSize}
          onClick={() => onClick(bigImages[0])}
          showLongPicture={showLongPicture} />
      </div>
      <Row gutter={4} className={styles.smallImages}>
        {smallImages.map((item, index) => (
          <Col span={6} className={styles.col} key={index}>
            <SmartImg
              postLoad={postLoad}
              level={2}
              type={item?.fileType}
              src={item?.thumbUrl}
              size={item?.fileSize}
              onClick={() => onClick(item)}
              showLongPicture={showLongPicture} />
          </Col>
        ))}
      </Row>
    </div>
  );
};

const Four = ({ type, bigImages, smallImages, onClick, style, showLongPicture, postLoad }) => (
  <div onClick={e => e.stopPropagation()}>
    <Row gutter={4} className={styles[style]}>
      <Col span={8} className={styles.col}>
        <SmartImg
          postLoad={postLoad}
          level={1}
          type={bigImages[0]?.fileType}
          src={bigImages[0]?.thumbUrl}
          size={bigImages[0]?.fileSize}
          onClick={() => onClick(bigImages[0])}
          showLongPicture={showLongPicture} />
      </Col>
      <Col span={4} className={styles.col}>
        <Row gutter={4} className={styles.smallRow}>
          {smallImages.map((item, index) => (
            <Col span={12} key={index} className={styles.smallCol}>
              <SmartImg
                postLoad={postLoad}
                level={3}
                type={item?.fileType}
                src={item?.thumbUrl}
                size={item?.fileSize}
                onClick={() => onClick(item)}
                showLongPicture={showLongPicture} />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  </div>
);


const Five = ({ type, bigImages, smallImages, onClick, style, imgData = [], onClickMore, showLongPicture, postLoad }) => (
  <div className={styles[style]} onClick={e => e.stopPropagation()}>
    <Row gutter={4} className={styles.bigImages}>
      {bigImages.map((item, index) => (
        <Col span={6} className={styles.col} key={index}>
          <SmartImg
            postLoad={postLoad}
            level={2}
            type={item?.fileType}
            src={item?.thumbUrl}
            size={item?.fileSize}
            onClick={() => onClick(item)}
            showLongPicture={showLongPicture} />
        </Col>
      ))}
    </Row>
    <Row gutter={4} className={styles.smallImages}>
      {smallImages.map((item, index) => (
        <Col span={4} className={styles.col} key={index}>
          <SmartImg
            postLoad={postLoad}
            level={3}
            type={item?.fileType}
            src={item?.thumbUrl}
            size={item?.fileSize}
            onClick={() => onClick(item)}
            showLongPicture={showLongPicture} />
          {imgData?.length > 5 && index === smallImages.length - 1 && (
            <div className={styles.modalBox} onClick={onClickMore}>{`+${imgData.length - 5}`}</div>
          )}
        </Col>
      ))}
    </Row>
  </div>
);


