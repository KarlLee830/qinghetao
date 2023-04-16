import React from 'react';
import { View } from '@tarojs/components';
import { Checkbox, Video } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import styles from '../../index.module.scss';

const VideoRender = inject('threadPost')(
  observer(({ ...props }) => {
    const { threadPost = {} } = props;
    const { postData = {}, partPayInfo = {} } = threadPost;
    const { video = {} } = postData;

    const { selectedVideo } = partPayInfo;

    const handleCheckStatusChange = (status) => {
      const indexOfVideo = selectedVideo.indexOf(video.id);
      if (status) {
        if (indexOfVideo === -1) {
          selectedVideo.push(video.id);
        }
      } else {
        if (indexOfVideo !== -1) {
          selectedVideo.splice(indexOfVideo, 1);
        }
      }

      partPayInfo.selectedVideo = [...selectedVideo];

      threadPost.partPayInfo = { ...threadPost.partPayInfo };
    };

    if (video.thumbUrl) {
      return (
        <View className={styles.videoWrapper}>
          <Video className={styles.video} src={video.thumbUrl} />
          <View className={styles.videoCheckBox}>
            <Checkbox checked={selectedVideo.indexOf(video.id) !== -1} onChange={handleCheckStatusChange} />
          </View>
        </View>
      );
    }

    return null;
  }),
);

export default VideoRender;
