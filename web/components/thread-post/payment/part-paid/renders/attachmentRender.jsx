import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';
import { Checkbox } from '@discuzqsdk/design';
import AttachmentView from '@components/thread/attachment-view';

const AttachmentRender = inject('threadPost')(
  observer(({ ...props }) => {
    const { threadPost } = props;
    const { postData = {} } = threadPost;
    const { files = {} } = postData;

    const { selectedIds, handleCheckboxChange } = props;

    const attachments = Object.values(files);

    return (
      <AttachmentView
        attachments={attachments}
        showPlayStatus={false}
        isShowShowMore={false}
        customActionArea={({ item }) => (
          <Checkbox
            checked={(selectedIds.indexOf(item.id)) !== -1}
            onChange={(status) => {
              handleCheckboxChange({ status, item });
            }}
          />
        )}
      />
    );
  }),
);

export default AttachmentRender;
