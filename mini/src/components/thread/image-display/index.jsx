import React, { useEffect, useMemo, useRef, useState } from 'react';
import ImagePreviewer from '@discuzqsdk/design/dist/components/image-previewer/index';
import Flex from '@discuzqsdk/design/dist/components/flex/index';
import { noop } from '../utils'
import styles from './index.module.scss';
import { View, Image } from '@tarojs/components'
import SmartImg from '@components/smart-image';
import Taro from '@tarojs/taro';
import { calcImageType, calcImageDefaultType } from '@common/utils/calc-image-type';
const { Col, Row } = Flex

// TODO 图片懒加载
const Index = ({
  imgData = [],
  onClickMore: gotoDetail,
  flat = false,
  platform = 'h5',
  isPay = false,
  onPay = noop,
  onImageReady = noop,
  relativeToViewport = true,
  updateViewCount = noop
}) => {
  const [visible, setVisible] = useState(false);
  const [defaultImg, setDefaultImg] = useState('');
  const ImagePreviewerRef = React.useRef(null);
  // const [firstImgData, setFirstImgData] = useState(null);
  const [firstImgData, setFirstImgData] = useState({ width: (imgData && imgData[0] && imgData[0].fileWidth) || 0, height: (imgData && imgData[0] && imgData[0]?.fileHeight) || 0 });

  const imagePreviewers = useMemo(() => imgData.filter(item => item?.needPay !== 1).map(item => item?.url), [imgData]);

  useEffect(() => {
    if (visible && ImagePreviewerRef && ImagePreviewerRef.current) {
      ImagePreviewerRef.current.show();
    }
  }, [visible]);

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

  // useEffect(() => {
  //   if (flat) return;
  //   let timer;
  //   if ( imgData && imgData.length !== 0 ) {
  //     Taro.getImageInfo({
  //       src: imgData[0].thumbUrl,
  //       complete: () => {
  //         timer && clearTimeout(timer);
  //       },
  //       fail: () => {
  //         setFirstImgData('fail');
  //       },
  //       success: (result) => {
  //         if ( !result.width || !result.height  ) {
  //           setFirstImgData('fail');
  //         } else {
  //           setFirstImgData({
  //             width: result.width,
  //             height: result.height
  //           });
  //         }
  //       },
  //     });
  //     timer = setTimeout(() => {
  //       if ( firstImgData === null ) {
  //         setFirstImgData('fail');
  //       }
  //     }, 2000);
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

  const style = useMemo(() => {
    const num = imgData.length > 5 ? 5 : imgData?.length;
    return `containerNum${num}`;
  }, [imgData]);

  const handleImages = () => {
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

    if (!flat && firstImgData === null) return <View className={`${styles['placeholder']}`} />;
    const res = handleImages();

    // 扁平处理
    if (flat) {
      return (
        <View>
          {res.bigImages.map((item, index) => (
            <View key={index} className={styles.flatItem}>
              <SmartImg autoSize noSmart type={item?.fileType} src={item?.url} mode='widthFix' onClick={() => onClick(item)} />
            </View>
          ))}
        </View>
      );
    }

    const type = firstImgData === 'fail' ? calcImageDefaultType(imgData.length) : calcImageType(firstImgData.width, firstImgData.height);
    if (imgData.length === 1) {
      return <One type={type} bigImages={res.bigImages} onClick={onClick} smallImages={res.smallImages} style={style} />;
    }
    if (imgData.length === 2) {
      return <Two type={type} bigImages={res.bigImages} onClick={onClick} smallImages={res.smallImages} style={style} />;
    }
    if (imgData.length === 3) {
      return <Three type={type} bigImages={res.bigImages} onClick={onClick} smallImages={res.smallImages} style={style} />;
    }
    if (imgData.length === 4) {
      return <Four type={type} bigImages={res.bigImages} onClick={onClick} smallImages={res.smallImages} style={style} />;
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
  }, [imgData, firstImgData]);

  return (
    <View onClick={gotoDetail} className={`${styles.container}`}>
      {ImageView}
      {visible && (
        <ImagePreviewer
          ref={ImagePreviewerRef}
          onComplete={() => {
            setVisible(false);
          }}
          imgUrls={imagePreviewers}
          currentUrl={defaultImg}
        />
      )}
    </View>
  );
};

export default React.memo(Index);

const One = ({ type, bigImages, onClick, style }) => {
  const item = bigImages[0];
  return (
    <View className={`${styles[style]} ${styles[type]}`} onClick={e => e.stopPropagation()}>
      <SmartImg level={1} type={item?.fileType} src={item?.thumbUrl} size={item?.fileSize} mode='aspectFill' onClick={() => onClick(item)} />
    </View>
  );
};

const Two = ({ type, bigImages, onClick, style }) => (
  <View onClick={e => e.stopPropagation()}>
    <Row gutter={4} className={`${styles[style]} ${styles[type]} ${styles.row}`} >
      {bigImages.map((item, index) => (
        <Col span={6} className={styles.col} key={index}>
          <SmartImg level={1} type={item?.fileType} src={item?.thumbUrl} size={item?.fileSize} mode='aspectFill' onClick={() => onClick(item)} />
        </Col>
      ))}
    </Row>
  </View>

);

const Three = ({ type, bigImages, smallImages, onClick, style }) => {
  if (type === 'long' || type === 'longitudinal') {
    return (
      <View className={`${styles[style]} ${styles[type]}`} onClick={e => e.stopPropagation()}>
        <Row gutter={4}>
          <Col span={8} className={styles.col}>
            <SmartImg level={1} type={bigImages[0]?.fileType} mode='aspectFill' src={bigImages[0]?.thumbUrl} size={bigImages[0]?.fileSize} onClick={() => onClick(bigImages[0])} />
          </Col>
          <Col span={4} className={styles.col}>
            <Row gutter={4} className={styles.smallRow}>
              {smallImages.map((item, index) => (
                <Col span={12} key={index} className={styles.smallCol}>
                  <SmartImg level={2} type={item?.fileType} mode='aspectFill' src={item?.thumbUrl} size={item?.fileSize} onClick={() => onClick(item)} />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </View>

    );
  }
  return (
    <View className={`${styles[style]} ${styles[type]}`} onClick={e => e.stopPropagation()}>
      <View className={styles.bigImages}>
        <SmartImg level={1} type={bigImages[0]?.fileType} src={bigImages[0]?.thumbUrl} size={bigImages[0]?.fileSize} mode='aspectFill' onClick={() => onClick(bigImages[0])} />
      </View>
      <Row gutter={4} className={styles.smallImages}>
        {smallImages.map((item, index) => (
          <Col span={6} className={styles.col} key={index}>
            <SmartImg level={2} type={item?.fileType} src={item?.thumbUrl} size={item?.fileSize} mode='aspectFill' onClick={() => onClick(item)} />
          </Col>
        ))}
      </Row>
    </View>
  );
}

const Four = ({ type, bigImages, smallImages, onClick, style }) => (
  <View onClick={e => e.stopPropagation()}>
    <Row gutter={4} className={styles[style]} >
      <Col span={8} className={styles.col}>
        <SmartImg level={1} type={bigImages[0]?.fileType} src={bigImages[0]?.thumbUrl} size={bigImages[0]?.fileSize} mode='aspectFill' onClick={() => onClick(bigImages[0])} />
      </Col>
      <Col span={4} className={styles.col}>
        <Row gutter={4} className={styles.smallRow}>
          {smallImages.map((item, index) => (
            <Col span={12} key={index} className={styles.smallCol}>
              <SmartImg level={3} type={item?.fileType} src={item?.thumbUrl} size={item?.fileSize} mode='aspectFill' onClick={() => onClick(item)} />
            </Col>
          ))}
        </Row>
      </Col>
    </Row>
  </View>

);

const Five = ({ bigImages, smallImages, onClick, style, imgData = [], onClickMore }) => (
  <View className={styles[style]} onClick={e => e.stopPropagation()}>
    <Row gutter={4} className={styles.bigImages}>
      {bigImages.map((item, index) => (
        <Col span={6} className={styles.col} key={index}>
          <SmartImg level={2} type={item?.fileType} src={item?.thumbUrl} size={item?.fileSize} mode='aspectFill' onClick={() => onClick(item)} />
        </Col>
      ))}
    </Row>
    <Row gutter={4} className={styles.smallImages}>
      {smallImages.map((item, index) => (
        <Col span={4} className={styles.col} key={index}>
          <SmartImg level={3} type={item?.fileType} src={item?.thumbUrl} size={item?.fileSize} mode='aspectFill' onClick={() => onClick(item)} />
          {imgData?.length > 5 && index === smallImages.length - 1 && (
            <View className={styles.modalBox} onClick={onClickMore}>{`+${imgData.length - 5}`}</View>
          )}
        </Col>
      ))}
    </Row>
  </View>
);
