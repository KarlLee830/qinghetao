import Toast from '@discuzqsdk/design/dist/components/toast';

// 附件、图片上传之前
export default function (cloneList, showFileList, type, site) {
  const { webConfig } = site;
  if (!webConfig) return false;
  // 站点支持的文件类型、文件大小
  const { supportFileExt, supportImgExt, supportMaxSize } = webConfig.setAttach;
  if (type === 'file') {
    // 当前选择附件的类型大小
    const arr = cloneList[0].name.split('.').pop();
    const fileType = arr.toLocaleLowerCase();
    const fileSize = cloneList[0].size;
    // 判断合法性
    const isLegalType = supportFileExt.toLocaleLowerCase().includes(fileType);
    const isLegalSize = fileSize > 0 && fileSize < supportMaxSize * 1024 * 1024;
    if (!isLegalType) {
      Toast.info({ content: '当前文件类型暂不支持' });
      return false;
    }
    if (!isLegalSize) {
      Toast.info({ content: `上传附件大小范围0 ~ ${supportMaxSize}MB` });
      return false;
    }
  } else if (type === 'image') {
    // 剔除超出数量9的多余图片
    const remainLength = 9 - showFileList.length; // 剩余可传数量
    cloneList.splice(remainLength, cloneList.length - remainLength);

    let isAllLegal = true; // 状态：此次上传图片是否全部合法
    cloneList.forEach((item, index) => {
      let imgType = item.imageType;
      if (!imgType) {
        const arr = item.name.split('.').pop();
        imgType = arr.toLocaleLowerCase();
      }
      const isLegalType = supportImgExt.toLocaleLowerCase().includes(imgType);

      // 存在不合法图片时，从上传图片列表删除
      if (!isLegalType) {
        cloneList.splice(index, 1);
        isAllLegal = false;
      }
    });

    !isAllLegal && Toast.info({ content: `仅支持${supportImgExt}类型的图片` });
    return true;
  }

  return true;
};