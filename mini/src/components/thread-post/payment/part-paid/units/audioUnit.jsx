import React from 'react';
import { Checkbox } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import Unit from '@components/thread-post/payment/part-paid/units/unit';
import AudioRender from '@components/thread-post/payment/part-paid/renders/audioRender';

const AudioUnit = inject('threadPost')(
  observer(({ ...props }) => {
    const { threadPost = {} } = props;
    const { postData = {}, partPayInfo = {} } = threadPost;
    const { audio = {} } = postData;

    const { selectedAudio = [] } = partPayInfo;

    if (!audio.mediaUrl) return null;

    const handleCheckStatusChange = (status) => {
      const indexOfAudio = selectedAudio.indexOf(audio.id);
      if (status) {
        if (indexOfAudio === -1) {
          selectedAudio.push(audio.id);
        }
      } else {
        if (indexOfAudio !== -1) {
          selectedAudio.splice(indexOfAudio, 1);
        }
      }

      partPayInfo.selectedAudio = [...selectedAudio];

      threadPost.partPayInfo = { ...threadPost.partPayInfo };
    };

    return (
      <Unit
        title={'音频'}
        rightActionRender={() => {
          return <Checkbox checked={selectedAudio.indexOf(audio.id) !== -1} onChange={handleCheckStatusChange} />;
        }}
      >
        <AudioRender />
      </Unit>
    );
  }),
);

export default AudioUnit;
