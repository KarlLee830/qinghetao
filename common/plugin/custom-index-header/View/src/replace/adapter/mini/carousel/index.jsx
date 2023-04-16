import React from 'react';
import { View, Swiper, SwiperItem, Image } from '@tarojs/components';
// import './index.module.scss';

const Carousel = (props) => {
  const toHref = (href) => {
    // window.open(href);
  };

  return (
    <View>
      <Swiper
        className="swiper-container"
        circular
        indicatorDots
        indicatorColor="#999"
        indicatorActiveColor="#bf708f"
        autoplay
      >
        <SwiperItem>
          <Image
            onClick={() => toHref('https://developer.discuz.chat/#/')}
            style={{ width: '100%', height: '100%' }}
            src="https://imgcache.qq.com/operation/dianshi/other/banner.184c37ee8e1b9d10d85ca74f8e7f3b573b959f83.png"
            mode="aspectFill"
          ></Image>
        </SwiperItem>

        <SwiperItem>
          <Image
            onClick={() => toHref('https://todo.tencent.com/')}
            style={{ width: '100%', height: '100%' }}
            src="https://main.qcloudimg.com/raw/062d8580c0ed1758510e00d98bc379a9.jpg"
            mode="aspectFill"
          ></Image>
        </SwiperItem>
      </Swiper>
    </View>
  );
};

export default Carousel;
