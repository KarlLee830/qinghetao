
export default function calcVideoSize({
    parentWidth = 343,
    v_width = null,
    v_height = null,
    viewHeight
}) {
    let height;
    let width;
    // 竖版视频
    if ( v_width && v_height && v_width < v_height ) {
        let calc_height = v_height;
        let calc_width = v_width;
      
        // 当前视频的高度大于可视区高度的70%，那么将视频高度缩减到可视区域的70%
        if ( viewHeight / v_height > 0.7 ) {
            calc_height = (viewHeight * 0.7).toFixed(2);
            calc_width = (v_width * (calc_height / v_height).toFixed(2)).toFixed(2);
            height = calc_height;
            width = calc_width;
            // 当视频宽度大于父元素高度时，需要对最终视频宽度重新计算
            if (width > parentWidth) {
                width = parentWidth;
                height = (height * (parentWidth / calc_width).toFixed(2)).toFixed(2);
            }
        } else {
            const percent = (calc_width / calc_height).toFixed(2);
            width = (parentWidth * 0.75).toFixed(2);
            height = (parentWidth * 0.75 / percent).toFixed(2);
        }
    } else {
      width = parentWidth
      if (v_width && v_height) {
        const percent = (v_width / v_height).toFixed(2);
        height = (parentWidth / percent).toFixed(2); 
      } else {
        height = (9 * (parentWidth) / 16).toFixed(2) || '224';
      }
    }
    return {width, height};
}