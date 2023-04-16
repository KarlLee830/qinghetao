import Taro from '@tarojs/taro';

export const getPlatform = () => Taro.getEnv()?.toLowerCase();
