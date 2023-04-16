import React from 'react';
import { inject, observer } from 'mobx-react';
import Unit from '@components/thread-post/payment/part-paid/units/unit';
import { Input } from '@discuzqsdk/design';

const PriceUnit = inject('threadPost')(observer(({ ...props }) => {
  const { threadPost } = props;
  const { partPayInfo } = threadPost;
  const { payPrice } = partPayInfo;

  const handlePrice = (val) => {
    const arr = val.match(/([1-9]\d{0,5}|0)(\.\d{0,2})?/);
    partPayInfo.payPrice = arr ? arr[0] : '';
  };

  return (
      <Unit
        title={'设置付费价格'}
        rightActionRender={() => (
            <>
              <Input
                mode={'number'}
                value={payPrice}
                placeholder={'金额'}
                maxLength={9}
                onChange={e => handlePrice(e.target.value)}
              />
              <span>&nbsp;元</span>
            </>
        )}
      />
  );
}));

export default PriceUnit;
