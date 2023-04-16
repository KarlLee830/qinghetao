import React from 'react';
import Carousel from 'nuka-carousel';
import { Tag, Icon } from '@discuzqsdk/design';
import styles from '../index.module.scss';

export default class extends React.Component {
  toHref = (href) => {
    window.open(href);
  };

  render() {
    return (
      <div className={styles.container}>
        <Carousel
          autoplay={true}
          initialSlideHeight={150}
          withoutControls={false}
          renderCenterLeftControls={({ previousSlide }) => (
            <Icon color="#fff" name="LeftOutlined" onClick={previousSlide} size={20}></Icon>
          )}
          renderCenterRightControls={({ nextSlide }) => (
            <Icon color="#fff" name="RightOutlined" onClick={nextSlide}></Icon>
          )}
        >
          <img
            onClick={() => this.toHref('https://developer.discuz.chat/#/')}
            style={{ height: '100%', objectFit: 'cover' }}
            src="https://imgcache.qq.com/operation/dianshi/other/banner.184c37ee8e1b9d10d85ca74f8e7f3b573b959f83.png"
          />

          <img
            onClick={() => this.toHref('https://todo.tencent.com/')}
            style={{ height: '100%', objectFit: 'cover' }}
            src="https://main.qcloudimg.com/raw/062d8580c0ed1758510e00d98bc379a9.jpg"
          />
        </Carousel>

        <Tag className={styles.tag}>广告</Tag>
      </div>
    );
  }
}
