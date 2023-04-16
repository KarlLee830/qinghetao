import shareImg from '../../mini/src/public/dzq-img/share.png';
import priceShareImg from '../../mini/src/public/dzq-img/priceShare.png';

export const priceShare = ({ isAnonymous, isPrice, path }) => {
  if (isPrice) {
    if (isAnonymous) {
      return {
        title: '......',
        path,
        imageUrl: shareImg,
      };
    }
    return {
      title: '......',
      path,
      imageUrl: priceShareImg,
    };
  }
};
