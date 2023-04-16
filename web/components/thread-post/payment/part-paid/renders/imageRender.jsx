import React from 'react';
import { inject, observer } from 'mobx-react';
import styles from '../../index.module.scss';
import { Checkbox } from '@discuzqsdk/design';

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
      <div>
        {imagesArray.map((imageInfo) => {
          return (
            <div key={imageInfo.id} className={styles.imageWrapper}>
              <img src={imageInfo.url} className={styles.image} />
              <div className={styles.imageCheckBox}>
                <Checkbox
                  checked={selectedImages.indexOf(imageInfo.id) !== -1}
                  onChange={(status) => {
                    handleSelectImage({ status, imageInfo });
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }),
);

export default ImageRender;
