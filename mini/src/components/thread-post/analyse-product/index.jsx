import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, Textarea, Button } from '@tarojs/components';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { observer, inject } from 'mobx-react';
import { goodImages } from '@common/constants/const';
import styles from './index.module.scss';

const Index = inject('threadPost', 'site')(observer(({ threadPost, site }) => {
  const { fetchProductAnalysis, setPostData } = threadPost;
  const { envConfig } = site;
  const [url, setUrl] = useState('');

  return (
    <View className={styles.wrapper}>
      <View className={styles['title']}>现支持以下商品链接</View>
      <View className={styles['product']}>
        {goodImages.map((item) => (
          <View className={styles['product-type']}>
            <Image src={`${envConfig.COMMON_BASE_URL}/${item.src}`} style={{width: `${item.width}px`, height: `${item.height}px`}} />
            <Text>{item.name}</Text>
          </View>
        ))}
      </View>
      <View className={styles['textarea-container']}>
        <Textarea
          className={styles.textarea}
          placeholderClass={styles['textarea-placeholder']}
          placeholder='请粘贴\输入商品分享链接'
          value={url}
          onInput={(e) => {
            setUrl(e.detail.value);
          }}
        />
      </View>
      <View className={styles['button-container']}>
        <Button
          className={styles['button']}
          onClick={async () => {
            const res = await fetchProductAnalysis({ address: url });
            const { code, data = {}, msg } = res;
            if (code === 0) {
              setPostData({ product: data });
              Taro.navigateBack();
            } else {
              Toast.error({ content: msg });
            }
          }}
        >
          确定
        </Button>
      </View>
    </View>
  );
}));


export default Index;
