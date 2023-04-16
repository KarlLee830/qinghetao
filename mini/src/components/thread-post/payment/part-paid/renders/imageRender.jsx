import React from 'react';
import { Checkbox } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import { View, Image } from '@tarojs/components';
import styles from '../../index.module.scss';

const ImageRender = inject('threadPost')(
  observer(({ ...props }) => {
    const { threadPost = {} } = props;
    let { postData = {}, partPayInfo = {} } = threadPost;
    const { images = {} } = postData;
    const { selectedImages = [] } = partPayInfo;

    const imagesArray = Object.values(images);

    const handleSelectImage = ({ status, imageInfo }) => {
      const actualSelectedStatus = selectedImages.indexOf(imageInfo.id) !== -1;
      if (status) {
        if (actualSelectedStatus) return;
        selectedImages.push(imageInfo.id);
      } else {
        if (!actualSelectedStatus) return;
        selectedImages.splice(selectedImages.indexOf(imageInfo.id), 1);
      }

      partPayInfo.selectedImages = [...selectedImages];

      threadPost.partPayInfo = { ...partPayInfo };
    };

    return (
      <View>
        {imagesArray.map((imageInfo) => {
          return (
            <View key={imageInfo.id} className={styles.imageWrapper}>
              <Image mode="aspectFill" src={imageInfo.thumbUrl} className={styles.image} />
              <View className={styles.imageCheckBox}>
                <Checkbox
                  checked={selectedImages.indexOf(imageInfo.id) !== -1}
                  onChange={(status) => {
                    handleSelectImage({ status, imageInfo });
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>
    );
  }),
);

export default ImageRender;
