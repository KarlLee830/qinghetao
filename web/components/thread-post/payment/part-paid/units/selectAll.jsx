import { inject, observer } from 'mobx-react';
import { Checkbox } from '@discuzqsdk/design';
import React from 'react';

const SelectAll = inject('threadPost')(
  observer(({ onSelect = () => {}, status = false }) => {
    return (
      <Checkbox checked={status} onChange={onSelect}>
        {status ? '取消全选' : '全选'}
      </Checkbox>
    );
  }),
);

export default SelectAll;
