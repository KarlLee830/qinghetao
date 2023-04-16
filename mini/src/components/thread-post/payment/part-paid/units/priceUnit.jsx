import React, { useState } from 'react';
import { inject, observer } from 'mobx-react';
import Unit from '@components/thread-post/payment/part-paid/units/unit';
import { Text } from '@tarojs/components';
import { Input } from '@discuzqsdk/design';

const PriceUnit = inject('threadPost')(
  observer(({ ...props }) => {
    const [refresh, setRefresh] = useState(false); // 强制刷新，保证输入框显示最新值
    const { threadPost } = props;
    const { partPayInfo } = threadPost;
    const { payPrice } = partPayInfo;

    const handlePrice = (val) => {
      const arr = val.match(/([1-9]\d{0,5}|0)(\.\d{0,2})?/);
      partPayInfo.payPrice = arr ? arr[0] : '';
      setRefresh(!refresh);
    };

    return (
      <Unit
        title="设置付费价格"
        rightActionRender={() => (
          <>
            <Input
              mode="number"
              value={payPrice}
              placeholder="金额"
              maxLength={9}
              onChange={e => handlePrice(e.target.value)}
            />
            <Text>&nbsp;元</Text>
          </>
        )}
      />
    );
  }),
);

export default PriceUnit;
