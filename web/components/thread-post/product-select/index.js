import React, { memo, useState } from 'react';
import { Input, Button, Toast } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import DDialog from '@components/dialog';
import styles from './index.module.scss';
import { goodImages } from '@common/constants/const';

const ProductSelect = (props) => {
  // state data
  const [link, setLink] = useState('');

  // handle
  const parseLink = async () => {
    // 1 没有链接给予提示
    if (link === '') {
      // console.log('商品链接不能为空');
      return;
    }

    // 2 有链接，发起请求解析商品
    const { onAnalyseSuccess, threadPost } = props;
    const res = await threadPost.fetchProductAnalysis({ address: link });
    const { code, data = {}, msg } = res;
    if (code === 0) {
      onAnalyseSuccess(data);
    } else {
      Toast.error({ content: msg });
    }
  };

  const content = (
    <div className={styles['parse-goods-box']}>
      <div className={styles.wrapper}>
        <div className={styles['parse-goods-title']}>现支持以下商品链接</div>
        <div className={styles['parse-goods-image']}>
          {goodImages.map(item => (
            <div className={styles['image-item']} key={item.name}>
              <img src={item.src} alt={item.name} width={item.width} height={item.height} />
              <span className={styles['image-text']}>{item.name}</span>
            </div>
          ))}
        </div>
        <Input.Textarea
          value={link}
          placeholder="请粘贴\输入商品的分享链接"
          maxLength={49999}
          rows={8}
          onChange={e => setLink(e.target.value)}
        />
        {!props.pc && (
          <div className={styles['parse-goods-btn']}>
            <Button onClick={props.cancel}>
              取消
            </Button>
            <Button type="primary" onClick={parseLink}>
              确定
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (!props.pc) return content;

  return (
    <DDialog
      visible={props.visible}
      className={styles.pc}
      onClose={props.cancel}
      title="添加商品"
      onCacel={props.cancel}
      onConfirm={parseLink}
    >
      {content}
    </DDialog>
  );
};

export default inject('threadPost')(observer(ProductSelect));
