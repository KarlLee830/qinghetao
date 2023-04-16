import Taro from '@tarojs/taro';

export const getElementRect = async (eleId = '', delay = 200) =>
  new Promise((resovle, reject) => {
    const t = setTimeout(() => {
      clearTimeout(t);

      Taro.createSelectorQuery()
        .select(`#${eleId}`)
        .boundingClientRect((rect) => {
          if (rect) {
            resovle(rect);
          } else {
            // reject('获取不到元素');
            resovle({ width: 378 });
          }
        })
        .exec();
    }, delay);
  });

export const arrTrans = (num, arr = []) => { // 一维数组转换为二维数组
    const iconsArr = []; // 声明数组
    arr?.forEach((item, index) => {
      const page = Math.floor(index / num); // 计算该元素为第几个素组内
      if (!iconsArr[page]) { // 判断是否存在
        iconsArr[page] = [];
      }
      iconsArr[page].push(item);
    });
    return iconsArr;
}

export const getWindowHeight = async () => 
    new Promise((resolve, reject) => {
        Taro.getSystemInfo({
            success: function (res) {
                resolve(res.windowWidth)
            },
            fail: function (err) {
                reject(667)
            }
        })
    })
     
// 随机数，获取当前canvas id
export const randomStr = (len = 16) => {
  const string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const l = string.length;
  let str = '';
  for (let i = 0; i < len; i++) {
    const index = Math.floor((Math.random() * 100 * l) % l);
    str += string[index];
  }
  return str;
};

//   const realScrollTop = e.scrollTop;
//     const that = this;
//     // 滚动的时候需要实时去计算当然应该在哪一屏幕
//     let tempScrollTop = 0;
//     const wholePageIndex = this.wholePageIndex;

//     for(var i=0;i<this.pageHeightArr.length;i++) {
//       tempScrollTop = tempScrollTop + this.pageHeightArr[i];
//       if(tempScrollTop > realScrollTop + this.windowHeight) {
//         console.log('set this.computedCurrentIndex' + i);
//         this.computedCurrentIndex = i;
//         break;
//       } 
//     }
//     const currentRenderIndex = this.currentRenderIndex;
//     if(this.computedCurrentIndex !== currentRenderIndex ) {
//       // 这里给不渲染的元素占位
//       let tempList = new Array(wholePageIndex+1).fill(0);
//       tempList.forEach((item, index) => {
//         if(this.computedCurrentIndex-1 <= index && index <=this.computedCurrentIndex+1) {
//           tempList[index] = that.wholeVideoList[index];
//         } else {
//           tempList[index] = { height: that.pageHeightArr[index]};
//         }
//       })

//       this.currentRenderIndex = this.computedCurrentIndex;