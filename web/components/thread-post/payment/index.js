/**
 * 付费表单 - 全部
 */
import React, { useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Input, Radio, Slider, Toast } from '@discuzqsdk/design';
import DDialog from '@components/dialog';
import styles from './index.module.scss';
import PropTypes from 'prop-types';
import throttle from '@common/utils/thottle';
import { THREAD_TYPE } from '@common/constants/thread-post';
import PartPaid from './part-paid';

const Index = inject('threadPost')(observer(({ threadPost, cancel, paidType, pc, visible }) => {
  const isPost = paidType === '全帖付费'; // 全帖付费
  const isAttach = paidType === '部分付费'; // 附件付费
  const isAudio = parseInt(paidType) === THREAD_TYPE.voice; // 音频付费

  const [price, setPrice] = useState(''); // 全帖价格\附件价格\音频价格
  const [freeAudio, setFreeAudio] = useState(false); // 默认音频不免费
  const [freeWords, setFreeWords] = useState(0); // 可免费查看数量的百分比数字

  useEffect(() => {
    // init
    const { postData } = threadPost;
    if (isPost) {
      postData.price && setPrice(postData.price);
      setFreeWords(postData.freeWords * 100);
    }

    if (isAttach) {
      // 部分付费，从帖子内容还原上次的选择情况
      threadPost.setPartPayFromPostData();
    }

    if (isAudio) {
      postData.audio?.price && setPrice(postData.audio?.price);
    }
  }, []);

  useEffect(() => {
    isAudio && price !== '' && freeAudio && setFreeAudio(false);
  }, [price]);

  // handle
  const handleRadioChange = (val) => {
    // 切换音频是否付费
    val && setPrice('');
    setFreeAudio(val);
  };

  const handlePrice = (val) => {
    const arr = val.match(/([1-9]\d{0,5}|0)(\.\d{0,2})?/);
    setPrice(arr ? arr[0] : '');
  };

  const checkState = () => {
    // 检查状态
    if (isAudio && freeAudio) return true;

    if (isAttach) {
      const partPayPrice = threadPost.partPayInfo.payPrice;
      if (!partPayPrice) {
        Toast.info({ content: '请输入付费金额', duration: 2000 });
        return false;
      }

      if (parseFloat(partPayPrice) < 0.1) {
        Toast.info({ content: '付费金额最低0.1元', duration: 2000 });
        return false;
      }

      if (parseFloat(partPayPrice) > 100000) {
        Toast.info({ content: '付费金额最高10w元', duration: 2000 });
        return false;
      }
    }

    if (isPost) {
      if (!price) {
        Toast.info({ content: '请输入付费金额', duration: 2000 });
        return false;
      }

      if (parseFloat(price) < 0.1) {
        Toast.info({ content: '付费金额最低0.1元', duration: 2000 });
        return false;
      }

      if (parseFloat(price) > 100000) {
        Toast.info({ content: '付费金额最高10w元', duration: 2000 });
        return false;
      }
    }

    return true;
  };

  const paidConfirm = () => {
    // 确认
    // 1 校验

    if (!checkState()) return;

    // 2 update store
    const { setPostData, postData } = threadPost;
    if (isPost) {
      setPostData({ price: parseFloat(price), freeWords: freeWords / 100 });
    }
    if (isAttach) {
      threadPost.setPartPayInfo();
    }
    if (isAudio) {
      setPostData({
        audio: {
          ...postData.audio,
          price: price ? parseFloat(price) : 0,
        },
      });
    }

    // 3 go back
    cancel();
  };

  const postComponent = () => (
        <div className={styles['paid-wrapper']}>
          <div className={styles['paid-item']}>
            <div className={styles.left}>支付金额</div>
            <div className={styles.right}>
              <Input
                mode="number"
                value={price}
                placeholder="金额"
                maxLength={9}
                onChange={e => handlePrice(e.target.value)}
              />
              &nbsp;元
            </div>
          </div>
          <div className={styles.free}>
            <div className={styles['free-title']}>免费查看字数</div>
            <Slider
              value={freeWords}
              defaultValue={freeWords}
              formatter={value => `${value} %`}
              onChange={throttle(e => setFreeWords(e), 100)}
            />
          </div>
        </div>
  );

  // 为部分付费的容器
  const attachmentComponent = () => (
        <div className={styles['paid-wrapper']}>
          <PartPaid />
        </div>
  );

  const btnComponent = () => (
        <div className={styles.btn}>
          <Button onClick={cancel}>取消</Button>
          <Button className={styles['btn-confirm']} onClick={paidConfirm}>
            确定
          </Button>
        </div>
  );

  const content = (
      <div className={`${styles.wrapper} ${pc ? styles.pc : styles.h5}`}>
        {isPost && postComponent()}
        {isAttach && attachmentComponent()}
        {!pc && btnComponent()}
      </div>
  );

  if (!pc) return content;

  return (
      <DDialog
        title={paidType}
        visible={visible}
        onClose={cancel}
        onCacel={cancel}
        onConfirm={paidConfirm}
      >
        {content}
      </DDialog>
  );
}));

Index.propTypes = {
  visible: PropTypes.bool, // PC端必传
  cancel: PropTypes.func.isRequired,
};

// 设置props默认类型
Index.defaultProps = {
  visible: false,
  paidType: '帖子付费',
  cancel: () => {},
};

export default Index;
