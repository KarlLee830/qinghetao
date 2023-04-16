/**
 * @description 部分付费页面组件
 * @author fishcui
 */
import React from 'react';
import { View } from '@tarojs/components';
import TextUnit from '@components/thread-post/payment/part-paid/units/textUnit';
import ImageUnit from '@components/thread-post/payment/part-paid/units/imageUnit';
import VideoUnit from '@components/thread-post/payment/part-paid/units/videoUnit';
import AudioUnit from '@components/thread-post/payment/part-paid/units/audioUnit';
import AttachmentUnit from '@components/thread-post/payment/part-paid/units/attachmentUnit';
import PriceUnit from '@components/thread-post/payment/part-paid/units/priceUnit';

import { inject, observer } from 'mobx-react';
import { THREAD_STATUS } from '@common/constants/thread-post';

@inject('threadPost')
@observer
class PartPaid extends React.Component {

  // 设置首次发帖时，部分付费内容默认全选
  componentDidMount() {
    const { threadStatus, postData, partPayInfo } = this.props.threadPost;

    if (threadStatus !== THREAD_STATUS.create) return;

    const { images = {}, files = {}, video = {}, audio = {} } = postData;
    const {
      hasDefaultImages,
      hasDefaultFiles,
      hasDefaultVideo,
      hasDefaultAudio,
    } = partPayInfo;

    setTimeout(() => {
      if (Object.keys(images).length > 0 && !hasDefaultImages) {
        partPayInfo.selectedImages = Object.values(images).map(i => i.id);
        partPayInfo.hasDefaultImages = true;
      }

      if (Object.keys(files).length > 0 && !hasDefaultFiles) {
        partPayInfo.selectedAttachments = Object.values(files).map(i => i.id);
        partPayInfo.hasDefaultFiles = true;
      }

      if (Object.keys(video).length > 0 && !hasDefaultVideo) {
        partPayInfo.selectedVideo = [video.id];
        partPayInfo.hasDefaultVideo = true;
      }

      if (Object.keys(audio).length > 0 && !hasDefaultAudio) {
        partPayInfo.selectedAudio = [audio.id];
        partPayInfo.hasDefaultAudio = true;
      }

      this.props.threadPost.partPayInfo = { ...partPayInfo };
    }, 100)
  }

  render() {
    return (
      <View>
        <TextUnit />
        <ImageUnit />
        <VideoUnit />
        <AudioUnit />
        <AttachmentUnit />
        <PriceUnit />
      </View>
    );
  }
}

export default PartPaid;
