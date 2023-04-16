import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';
import { useSelectAll } from '@components/thread-post/payment/part-paid/hooks';
import Unit from '@components/thread-post/payment/part-paid/units/unit';
import SelectAll from '@components/thread-post/payment/part-paid/units/selectAll';
import AttachmentRender from '@components/thread-post/payment/part-paid/renders/attachmentRender';

const AttachmentUnit = inject('threadPost')(
  observer(({ ...props }) => {
    const { threadPost } = props;
    const { postData = {}, partPayInfo = {} } = threadPost;
    const { files = {} } = postData;

    const attachments = Object.values(files);

    const { selectedAttachments: selectedIds = [] } = partPayInfo;

    const setSelectedIds = (nextData) => {
      partPayInfo.selectedAttachments = nextData;

      threadPost.partPayInfo = { ...threadPost.partPayInfo };
    };

    const { setSelectAllStatus, selectAllStatus } = useSelectAll({
      selectedData: selectedIds,
      dataset: attachments,
    });

    const handleCheckboxChange = ({ status, item }) => {
      if (status) {
        if (selectedIds.indexOf(item.id) === -1) {
          selectedIds.push(item.id);
        }
      } else {
        if (selectedIds.indexOf(item.id) !== -1) {
          selectedIds.splice(selectedIds.indexOf(item.id), 1);
        }
      }

      setSelectedIds([...selectedIds]);
    };

    const handleSelectAll = (status) => {
      if (status) {
        setSelectedIds(
          attachments.map((item) => {
            return item.id;
          }),
        );
        setSelectAllStatus(status);
      } else {
        setSelectedIds([]);
        setSelectAllStatus(status);
      }
    };

    // 判断如果无附件，不显示
    if (attachments.length === 0) {
      return null;
    }

    return (
      <Unit
        title={'附件'}
        rightActionRender={() => {
          return <SelectAll status={selectAllStatus} onSelect={handleSelectAll} />;
        }}
      >
        <AttachmentRender
          selectedIds={selectedIds}
          setSelectedIds={setSelectedIds}
          handleCheckboxChange={handleCheckboxChange}
        />
      </Unit>
    );
  }),
);

export default AttachmentUnit;
