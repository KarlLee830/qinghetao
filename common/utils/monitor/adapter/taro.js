import Taro from '@tarojs/taro';
export default function setTitle(title = '') {
    if (!title) return;
    Taro.setNavigationBarTitle({
        title
    })
}