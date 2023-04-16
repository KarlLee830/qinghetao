import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import RichText from '@discuzqsdk/design/dist/components/rich-text/index';
import ImagePreviewer from '@discuzqsdk/design/dist/components/image-previewer/index';
import { noop, handleLink } from '../utils'
import Router from '@discuzqsdk/sdk/dist/router';
import Taro from '@tarojs/taro'

import fuzzyCalcContentLength from '@common/utils/fuzzy-calc-content-length';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import { View } from '@tarojs/components'
import styles from './index.module.scss';
import { urlToLink } from '@common/utils/replace-url-to-a';
import replaceStringInRegex from '@common/utils/replace-string-in-regex';
import calcCosImageQuality from '@common/utils/calc-cos-image-quality';

import config from '../../../app.config';

/**
 * 帖子内容展示
 * @prop {string}   content 内容
 * @prop {boolean}  useShowMore 是否需要"查看更多"
 * @prop {function} onRedirectToDetail 跳转到详情页面，当点击内容或查看更多内容超出屏幕时跳转到详情页面
 * @prop {function} onOpen 内容展开事件
 * @prop {function} onTextItemClick 文本内容块点击事件（会覆盖内容里的a跳转）
 */

const PostContent = ({
  content,
  useShowMore = false,// 是否需要"查看更多"
  onRedirectToDetail = noop,
  customHoverBg = false,
  relativeToViewport = true,
  changeHeight = noop,
  setUseShowMore = noop,
  setUseCloseMore = noop,
  updateViewCount = noop,
  transformer = parsedDom => parsedDom,
  onTextItemClick = null,
  ...props
}) => {
  // 内容是否超出屏幕高度
  const [contentTooLong, setContentTooLong] = useState(false); // 超过1200个字符
  const [cutContentForDisplay, setCutContentForDisplay] = useState('');
  const [showMore, setShowMore] = useState(false); // 根据文本长度显示"查看更多"
  const [imageVisible, setImageVisible] = useState(false);
  const [imageUrlList, setImageUrlList] = useState([]);
  const [imageLgAndSmUrlList, setImageLgAndSmUrlList] = useState([]);
  const [curImageUrl, setCurImageUrl] = useState("");
  const [appPageLinks, setAppPageLinks] = useState([]);
  const ImagePreviewerRef = useRef(null); // 富文本中的图片也要支持预览
  const contentWrapperRef = useRef(null);
  const clickedImageId = useRef(null);

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

  const onShowMore = useCallback((e) => {
    e && e.stopPropagation();
    updateViewCount();

    if (contentTooLong) {
      // 内容过长直接跳转到详情页面
      onRedirectToDetail && onRedirectToDetail();
    } else {
      setOpenedMore(false);
      // setUseShowMore()
      // setShowMore(false);
    }
  }, [contentTooLong]);

  // 点击收起更多
  const onCloseMore = useCallback(e => {
    e && e.stopPropagation();
    setOpenedMore(true);
    // setUseCloseMore();
  }, [contentTooLong])


  const handleClick = (e, node) => {
    if(node && node.name === 'image') return
    // e && e.stopPropagation();
    const { url, isExternaLink } = handleLink(node)
    if (isExternaLink) return

    if (url) {
      Router.push({ url })
    } else {
      if (clickedImageId.current !== e.target.id) {
        onRedirectToDetail()
      }
    }
  }

  // 显示图片的预览
  useEffect(() => {
    if (imageVisible && ImagePreviewerRef && ImagePreviewerRef.current) {
      ImagePreviewerRef.current.show();
    }
  }, [imageVisible]);

  // 点击富文本中的链接
  const handleLinkClick = (e) => {
    updateViewCount();
    setTimeout(() => { // 等待store更新完成后跳转
    }, 500);

    // 内链跳转
    let content = e?.children[0]?.data || "";
    if (content.indexOf("http") === -1) {
      content = content[0] !== '/' ? '/' + content : content;
      if (appPageLinks.indexOf(content) !== -1) {
        Taro.navigateTo({ url: content });
      }
    }
  }

  // 点击富文本中的图片
  const handleImgClick = (node, event) => {
    updateViewCount();
    if (node?.attribs?.src) {
      setImageVisible(true);
      // 替换大图
      const imgSrcObj = imageLgAndSmUrlList.find(item => item.smSrc === node.attribs.src);
      setCurImageUrl(imgSrcObj?.lgSrc || node.attribs.src);
      clickedImageId.current = event?.target?.id;
    }
  }

  // 超过1200个字符，截断文本用于显示
  const getCutContentForDisplay = (maxContentLength) => {
    const ctn = filterContent;
    let ctnSubstring = ctn.substring(0, maxContentLength); // 根据长度截断

    const cutPoint = (ctnSubstring.lastIndexOf("<img") > 0) ?
      ctnSubstring.lastIndexOf("<img") : ctnSubstring.length;

    ctnSubstring = ctnSubstring.substring(0, cutPoint);
    setCutContentForDisplay(ctnSubstring);
  };

  // const getImagesFromText = (text) => {
  //   const _text = replaceStringInRegex(text, "emoj", '');
  //   const images = _text.match(/<img\s+[^<>]*src=[\"\'\\]+([^\"\']*)/gm) || [];

  //   for (let i = 0; i < images.length; i++) {
  //     images[i] = images[i].replace(/<img\s+[^<>]*src=[\"\'\\]+/gm, "") || "";
  //   }
  //   return images;
  // }

  const generateAppRelativePageLinks = () => {
    const pageLinks = [];
    for (const pkg of config.subPackages) {
      const root = pkg.root;
      for (const page of pkg.pages) {
        pageLinks.push(`/${root}/${page}`);
      }
    }
    setAppPageLinks(pageLinks);
  }

  useEffect(() => {
    const lengthInLine = parseInt((contentWrapperRef.current.offsetWidth || 704) / 32);

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

    generateAppRelativePageLinks();

  }, [filterContent]);
  return (
    <View className={styles.container} {...props}>
      <View
        ref={contentWrapperRef}
        className={`${styles.contentWrapper} ${openedMore && showMore ? styles.hideCover : ''} ${customHoverBg ? styles.bg : ''}`}
        onClick={ handleClick }
      >
        <View className={styles.content}>
          <RichText
            content={openedMore && cutContentForDisplay ? cutContentForDisplay : urlToLink(filterContent)}
            onClick={handleClick}
            onImgClick={handleImgClick}
            onLinkClick={handleLinkClick}
            transformer={transformer}
            iframeWhiteList={['bilibili', 'youku', 'iqiyi', 'music.163.com', 'ixigua', 'qq.com', 'myqcloud.com']}
          />

          {imageVisible && (
            <ImagePreviewer
              ref={ImagePreviewerRef}
              onComplete={() => {
                setImageVisible(false);
              }}
              imgUrls={imageUrlList}
              currentUrl={curImageUrl}
            />
          )}
          {
            onTextItemClick && <View className={styles.shade} onClick={onTextItemClick}></View>
          }
        </View>
      </View>
      { useShowMore && showMore && (
        <View className={styles.showMore} onClick={openedMore ? onShowMore : onCloseMore}>
          <View className={styles.hidePercent}>{texts[openedMore ? 'showMore' : 'closeMore']}</View>
          <Icon className={openedMore ? styles.icon : styles.icon_d} name="RightOutlined" size={12} />
        </View>
      )}
    </View>
  );
};

export default React.memo(PostContent);
