import Search from './search-input';
import Carousel from './carousel';
import { View } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

export default function (props) {
  const { dzqRouter, siteData } = props;

  const top = Taro.getSystemInfoSync().safeArea.top;

  const onInputClick = () => {
    Taro.navigateTo({ url: '/subPages/search/index' });
  };

  return (
    <View className={styles.container} style={{ paddingTop: `${top}px` }}>
      <Search site={siteData} onInputClick={onInputClick}></Search>
      <Carousel></Carousel>
    </View>
  );
}
