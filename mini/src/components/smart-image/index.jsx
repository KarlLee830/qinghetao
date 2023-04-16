import React, {useState, useCallback, useMemo} from 'react';
import { View, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import {isLongImage} from '@common/utils/calc-image-type';
import calcCosImageQuality from '@common/utils/calc-cos-image-quality';

const SmartImg = ({level, autoSize = false, type, src, onClick, mode = '', noSmart = false, size = 0}) => {
    const [isLong, changeIsLong] = useState(false);

  const imgSrc = useMemo(() => {
        if (!src) return '';
        if (size / 1024 / 1024 > 2) return calcCosImageQuality(src, type, 100);
        if (noSmart) return calcCosImageQuality(src, type, 0);
        return calcCosImageQuality(src, type, level);
    }, [noSmart, src, type, level])


    const imgOnload = useCallback((data) => {
        if (data && data.detail) {
            const { height, width } = data.detail;
            changeIsLong(isLongImage(width,height));
        }

    }, [src])

    return (
        <View className={styles.box}>
            <Image src={imgSrc}  onLoad={imgOnload} mode={mode} onClick={onClick}/>
            {!noSmart && isLong && <View className={styles.longImgBox}>长图</View>}
        </View>
    );
}

export default SmartImg;
