import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { inject, observer } from 'mobx-react';
import { Icon, RichText, ImagePreviewer } from '@discuzqsdk/design';
import { noop } from '../utils';
import classnames from 'classnames';

import fuzzyCalcContentLength from '@common/utils/fuzzy-calc-content-length';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import { urlToLink } from '@common/utils/replace-url-to-a';
import replaceStringInRegex from '@common/utils/replace-string-in-regex';
import isServer from '@common/utils/is-server';
import calcCosImageQuality from '@common/utils/calc-cos-image-quality';
import styles from './index.module.scss';

/**
 * 帖子内容展示
 * @prop {string}   content 内容
 * @prop {boolean}  needShowMore 是否需要"查看更多"
 * @prop {function} onRedirectToDetail 跳转到详情页面，当点击内容或查看更多内容超出屏幕时跳转到详情页面
 * @prop {function} onOpen 内容展开事件
 * @prop {function} onTextItemClick 文本内容块点击事件（会覆盖内容里的a跳转）
 */

const PostContent = ({
  content,
  needShowMore = true, // 是否需要"查看更多"
  useShowMore = false,
  onRedirectToDetail = noop,
  customHoverBg = false,
  usePointer = true,
  onOpen = noop,
  onClose = noop,
  updateViewCount = noop,
  transformer = parsedDom => parsedDom,
  onTextItemClick = null,
  ...props
}) => {
  // 内容是否超出屏幕高度
  // const [indrag, setIndrag] = useState(false);
  const [contentTooLong, setContentTooLong] = useState(false); // 超过1200个字符
  const [cutContentForDisplay, setCutContentForDisplay] = useState('');
  const [showMore, setShowMore] = useState(false); // 根据文本长度显示"查看更多"
  const [imageVisible, setImageVisible] = useState(false);
  const [imageUrlList, setImageUrlList] = useState([]);
  const [imageLgAndSmUrlList, setImageLgAndSmUrlList] = useState([]);
  const [curImageUrl, setCurImageUrl] = useState('');
  const ImagePreviewerRef = useRef(null); // 富文本中的图片也要支持预览
  const contentWrapperRef = useRef(null);
  let mousePosition = { x: 0, y: 0 };

  const texts = {
    showMore: '查看更多',
    closeMore: '折叠',
  };

  const [openedMore, setOpenedMore] = useState(useShowMore);

  const replaceImgSrc = (src) => {
    const [path] = src.split('?');
    const type = path.substr(path.lastIndexOf('.') + 1);
    return calcCosImageQuality(src, type, 7);
  }
  
  // 将图片链接替换成 webp 及小图
  const replaceImagesFromText = (contentText) => {
    const images = contentText.match(/<img.*?[\/]?>/g)?.filter(image => (!image.includes('emoji')));

    if (images && images.length) {
      const imageLgAndSmUrlList = [];
      const imageUrlList = [];
      for (let i = 0; i < images.length; i++) {
        const imgSrcs = images[i].match(/src=[\'\"]?([^\'\"]*)[\'\"]?/i);
        if (imgSrcs && imgSrcs.length) {
          let imgSrc = imgSrcs[0];
          imgSrc = imgSrc ? imgSrc.substring(5, imgSrc.length-1) : '';
          const smImgSrc = imgSrc ? replaceImgSrc(imgSrc) : '';
          const newImg = images[i].replace(imgSrc, smImgSrc);
          imageUrlList.push(imgSrc);
          // 保存图片的缩略图和原图，用于预览时查找对应链接
          imageLgAndSmUrlList.push({
            smSrc: smImgSrc,
            lgSrc: imgSrc
          });
          contentText = contentText.replace(images[i], newImg);
        }
      }
      if (imageUrlList.length) {
        setImageUrlList(imageUrlList);
      }
      if (imageLgAndSmUrlList.length) {
        setImageLgAndSmUrlList(imageLgAndSmUrlList);
      }
    };
    return contentText;
  }

  // 过滤内容
  const filterContent = useMemo(() => {
    let newContent = content ? s9e.parse(content) : '';
    newContent = xss(newContent);
    newContent = replaceImagesFromText(newContent);
    return newContent;
  }, [content]);

  // 点击"查看更多"
  const onShowMore = useCallback(
    (e) => {
      e && e.stopPropagation();
      updateViewCount();
      if (contentTooLong) {
        // 内容过长直接跳转到详情页面
        onRedirectToDetail && onRedirectToDetail();
      } else {
        setOpenedMore(false);
        onOpen();
      }
    },
    [contentTooLong],
  );

  // 点击收起更多
  const onShowClose = useCallback(e => {
    e && e.stopPropagation();
    setOpenedMore(true);
    updateViewCount();
    onClose();
  },
    [contentTooLong],
  );

  // 点击帖子
  const handleClick = (e) => {
    if (e.target.localName === 'a') {
      return;
    }
    if (e.pageX !== mousePosition.x || e.pageY !== mousePosition.y) {
      console.log(e.pageX !== mousePosition.x || e.pageY !== mousePosition.y, e, mousePosition)
      return; // 如果有拖动行为 不触发点击事情
    }
    // if (mouseInDrag) {
    //   console.log(mouseInDrag);
    //   return; // 如果有拖拽选中过文件不触发点击事情
    // }
    e && e.stopPropagation();
    // 点击图片不跳转，图片不包含表情
    if (!(e?.target?.getAttribute('src') && e?.target?.className?.indexOf('qq-emotion') === -1)) {
      onRedirectToDetail();
    }
  };

  // 显示图片的预览
  useEffect(() => {
    if (imageVisible && ImagePreviewerRef && ImagePreviewerRef.current) {
      ImagePreviewerRef.current.show();
    }
  }, [imageVisible]);

  // 点击富文本中的图片
  const handleImgClick = (e) => {
    updateViewCount();
    if (e?.attribs?.src) {
      setImageVisible(true);
      // 替换大图
      const imgSrcObj = imageLgAndSmUrlList.find(item => item.smSrc === e.attribs.src);
      setCurImageUrl(imgSrcObj?.lgSrc || e.attribs.src);
    }
  };


  // 点击富文本中的链接
  const handleLinkClick = () => {
    updateViewCount();
    setTimeout(() => { // 等待store更新完成后跳转
    }, 500);
  };

  // 超过1200个字符，截断文本用于显示
  const getCutContentForDisplay = (maxContentLength) => {
    const ctn = filterContent;
    let ctnSubstring = ctn.substring(0, maxContentLength); // 根据长度截断

    const cutPoint = ctnSubstring.lastIndexOf('<img') > 0 ? ctnSubstring.lastIndexOf('<img') : ctnSubstring.length;

    ctnSubstring = ctnSubstring.substring(0, cutPoint);
    setCutContentForDisplay(ctnSubstring);
  };

  // const getImagesFromText = (text) => {
  //   const _text = replaceStringInRegex(text, 'emoj', '');
    // const images = _text.match(/<img\s+[^<>]*src=[\"\'\\]+([^\"\']*)/gm) || [];

  //   for (let i = 0; i < images.length; i++) {
  //     images[i] = images[i].replace(/<img\s+[^<>]*src=[\"\'\\]+/gm, '') || '';
  //   }
  //   return images;
  // };

  useEffect(() => {
    const lengthInLine = parseInt((contentWrapperRef.current.offsetWidth || 704) / 16);
    const length = fuzzyCalcContentLength(filterContent, lengthInLine); // 大致计算文本长度
    const maxContentLength = lengthInLine * 6; // 如果默认长度是704，一共可容纳264个字符

    if (length < maxContentLength && length <= 1200) {
      // 显示6行内容
      setShowMore(false);
    } else {
      // 超过6行
      setShowMore(true);
    }
    if (length > 1200) { // 超过一页的超长文本
      if (openedMore) getCutContentForDisplay(1200);
      setContentTooLong(true);
    } else {
      setContentTooLong(false);
    }

    // const imageUrlList = getImagesFromText(filterContent);
    // if (imageUrlList.length) {
    //   setImageUrlList(imageUrlList);
    // }
  }, [filterContent]);
  
  return (
    <div className={classnames(styles.container, usePointer ? styles.usePointer : '')} {...props}>
      <div
        ref={contentWrapperRef}
        className={`${styles.contentWrapper} ${(openedMore && showMore) ? styles.hideCover : ''} ${customHoverBg ? styles.bg : ''}`}
        onClick={showMore ? onShowMore : handleClick}
        onMouseDown={e => {
          mousePosition = { x: e.pageX, y: e.pageY }; // 记录一下点击鼠标时的坐标，判断是否有拖动行为
        }}
      >
        <div className={styles.content}>
          <RichText
            content={openedMore && cutContentForDisplay ? cutContentForDisplay : urlToLink(filterContent)}
            onClick={handleClick}
            onImgClick={handleImgClick}
            onLinkClick={handleLinkClick}
            transformer={transformer}
            iframeWhiteList={['bilibili', 'youku', 'iqiyi', 'music.163.com', 'ixigua', 'qq.com', 'myqcloud.com', isServer() ? global.ctx.req.headers.host : window.location.hostname]}
          />
          {imageVisible && (
            <ImagePreviewer
              ref={ImagePreviewerRef}
              onClose={() => {
                setImageVisible(false);
              }}
              imgUrls={imageUrlList}
              currentUrl={curImageUrl}
            />
          )}
          {
            onTextItemClick && <div className={styles.shade} onClick={onTextItemClick}></div>
          }
        </div>
      </div>
      {needShowMore && showMore && (
        <div className={styles.showMore} onClick={openedMore ? onShowMore : onShowClose}>
          {/* {useShowMore + ''} */}
          <div className={styles.hidePercent}>{texts[openedMore ? 'showMore' : 'closeMore']}</div>
          <Icon className={openedMore ? styles.icon : styles.icon_d} name="RightOutlined" size={12} />
        </div>
      )}
    </div>
  );
};

export default PostContent;
