import React from 'react';
import { inject, observer } from 'mobx-react';
import AudioPlay from '../../../../thread/audio-play';

const AudioRender = inject('threadPost')(
  observer(({ ...props }) => {
    const { threadPost = {} } = props;
    const { postData = {} } = threadPost;
    const { audio = {} } = postData;

    return <AudioPlay url={audio.mediaUrl} />;
  }),
);

export default AudioRender;
