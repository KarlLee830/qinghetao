import React, { useMemo, useState, useEffect } from 'react';
import ImagePreviewer from '@discuzqsdk/design/dist/components/image-previewer/index';
import img from './index.module.scss';
import { View, Text, Image } from '@tarojs/components';

const Index = ({ imgData = [] }) => {
  const [visible, setVisible] = useState(false);
  const [defaultImg, setDefaultImg] = useState('');

  const imagePreviewers = useMemo(() => imgData.map((item) => item.url), [imgData]);

  const onClick = (id) => {
    imgData.forEach((item) => {
      if (item.id === id) {
        setDefaultImg(item.url);
      }
    });
    setTimeout(() => {
      setVisible(true);
    }, 0);
  };

  const onClickMore = (e) => {
    e.stopPropagation();

    setDefaultImg(imgData[0].url);
    setTimeout(() => {
      setVisible(true);
    }, 0);
  };

  const HomeImg = () => {
    if (imgData.length <= 2) {
      if (imgData.length === 0) {
        return '';
      }
      return (
        <View className={img[`images${imgData.length}`]}>
          {imgData.map((item, index) => (
            <Image
              key={index}
              className={img[`imagesBox${imgData.length}`]}
              src={item.thumbUrl}
              onClick={() => onClick(item.id)}
            ></Image>
          ))}
        </View>
      );
    }
    let imageList = [];
    let otherImage = [];
    let numContent = 0;
    if (imgData.length < 5) {
      imageList = imgData.slice(0, 1);
      otherImage = imgData.slice(1, imgData.length + 1);
    } else {
      if (imgData.length > 5) {
        numContent = imgData.length - 5;
      }
      imageList = imgData.slice(0, 2);
      otherImage = imgData.slice(2, 5);
    }

    return (
      <View className={img[`images${imgData.length > 5 ? 5 : imgData.length}`]}>
        <View className={img[`imagesTop${imgData.length > 5 ? 5 : imgData.length}`]}>
          {imageList.map((item, index) => (
            <Image
              key={index}
              className={img[`imagesTopData${imgData.length > 5 ? 5 : imgData.length}`]}
              src={item.thumbUrl}
              alt=""
              mode="aspectFill"
              onClick={() => onClick(item.id)}
            />
          ))}
        </View>
        <View className={img[`imagesBotom${imgData.length > 5 ? 5 : imgData.length}`]}>
          {otherImage.map((item, index) => (
            <View key={index} className={img[`imagesBotomData${imgData.length > 5 ? 5 : imgData.length}`]}>
              <Image
                className={img[`imagesBotomDataPath${imgData.length > 5 ? 5 : imgData.length}`]}
                src={item.thumbUrl}
                alt=""
                onClick={() => onClick(item.id)}
              />
              {imgData.length > 5 && index === 2 && (
                <View className={img.modalBox} onClick={onClickMore}>
                  <Text className={img.imgSpan}>{`+${numContent}`}</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };
  return (
    <View className={img.indexImage}>
      <View className={img.imageBox}>
        <HomeImg />
      </View>
      <ImagePreviewer
        visible={visible}
        onClose={() => {
          setVisible(false);
        }}
        imgUrls={imagePreviewers}
        currentUrl={defaultImg}
      />
    </View>
  );
};

export default React.memo(Index);
