import React, { useMemo } from 'react';
import Avatar from '@discuzqsdk/design/dist/components/avatar/index';
import { View } from '@tarojs/components';
import { useCallback } from 'react';
import calcCosImageQuality from '@common/utils/calc-cos-image-quality';
import classNames from 'classnames';
import styles from './index.module.scss';

export default function avatar(props) {
  const {
    userId = null,
    image = '',
    name = '匿',
    onClick = () => {},
    className = '',
    circle = true,
    size = 'primary',
    withStopPropagation = false, // 是否需要阻止冒泡 默认false不阻止
    level = 6,
    wrapperClass = '',
  } = props;

  const userName = useMemo(() => {
    const newName = name?.toLocaleUpperCase()[0];
    return newName;
  }, [name]);

  const currAvatarImage = useMemo(() => {
    if (!image || image === '') return image;
    if ( /(http|https):\/\/.*?(gif)/.test(image) ) {
      return calcCosImageQuality(image, 'gif');
    } else {
      return calcCosImageQuality(image, 'png', level);
    }
  }, [image, level]);

  const clickHandle = useCallback(
    (e) => {
      if (withStopPropagation) {
        e.stopPropagation();
      }
      if (!userId) return;
      onClick && onClick(e);
    },
    [userId, withStopPropagation],
  );

  if (image && image !== '') {
    return (
      <View onClick={clickHandle} className={classNames(styles.avatarWrapper, wrapperClass)}>
        <Avatar className={className} circle={circle} image={currAvatarImage} size={size}></Avatar>
      </View>
    );
  }

  return (
    <View onClick={clickHandle} className={classNames(styles.avatarWrapper, wrapperClass)}>
      <Avatar className={className} circle={circle} text={userName} size={size}></Avatar>
    </View>
  );
}
