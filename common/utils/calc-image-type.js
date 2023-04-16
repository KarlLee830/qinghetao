export function calcImageType(width, height) {
    if ( !width || !height ) {
        return 'transverse' 
    }
    if ( width >= height ) {
        // 全景图
        if ( width/height >= 2 ) {
          return 'panorama'
        } else {
          return 'transverse'
        }
      } else {
        // 长图
        if ( height/width >= 2.5 ) {
          return 'long'
        } else {
          return 'longitudinal'
        }
    }
}

export function calcImageDefaultType(n) {
    if (n === 3) {
        return 'longitudinal';
      } else {
        return 'panorama';
    }
}

export function isLongImage(w, h) {
  return h / w >= 2.5;
}