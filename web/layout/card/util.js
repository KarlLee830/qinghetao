/* eslint-disable */
import htmlparser2 from 'htmlparser2';
import s9e from '@common/utils/s9e';
import html2canvas from 'html2canvas'


export const hideImage = 'data:image/png;base64,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'


export const cutText = text =>{
  const c = [];
  const { Parser } = htmlparser2;
  const parse = new Parser({
    ontext(t) {
      c.push(t);
    },
    onclosetag(tagname) {
      // 处理换行
      if (tagname === 'br') {
        c.push('\n');
      }
    },
  });
  parse.parseComplete(s9e.parse(text));
  const rt = (c.join('')) ;
  console.log(rt.slice(0, Math.ceil(rt.length/2)) + (rt.length>1?'...':''))
  return rt.slice(0, Math.ceil(rt.length/2)) + (rt.length>1?'...':'');
};

export const generateImageUrlByHtml = (element) => {
  // A polyfill based on toBlob.
  if (!HTMLCanvasElement.prototype.toBlob) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
      value: function (callback, type, quality) {
        const binStr = atob(this.toDataURL(type, quality).split(',')[1])
        const len = binStr.length
        const arr = new Uint8Array(len)
        for (let i = 0; i < len; i++) {
          arr[i] = binStr.charCodeAt(i)
        }
        callback(new Blob([arr], { type: type || 'image/png' }))
      },
    })
  }
  return new Promise(async (resolve, reject) => {
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
      })
      const blobUrl = canvas.toDataURL('image/png')
      resolve(blobUrl)
    } catch (error) {
      reject(error)
    }
  })
}

export const savePic = (Url) => {
  var triggerEvent = "touchstart"; //指定下载方式
  var blob=new Blob([''], {type:'application/octet-stream'}); //二进制大型对象blob
  var url = URL.createObjectURL(blob); //创建一个字符串路径空位
  var a = document.createElement('a'); //创建一个 a 标签
  a.href = Url;  //把路径赋到a标签的href上
    //正则表达式，这里是把图片文件名分离出来。拿到文件名赋到a.download,作为文件名来使用文本
  a.download = '分享海报'; 
    
  var e = new MouseEvent('click', ( true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null));  
  //派遣后，它将不再执行任何操作。执行保存到本地
  a.dispatchEvent(e);
    //释放一个已经存在的路径（有创建createObjectURL就要释放revokeObjectURL）
  URL.revokeObjectURL(url);  
}
