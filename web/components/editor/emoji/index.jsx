import React, { useState, useEffect, useRef } from 'react';
// import Carousel from 'react-multi-carousel';
// import 'react-multi-carousel/lib/styles.css';
import styles from './index.module.scss';
// import './carousel.scss';

// SwiperCore.use([Pagination]);

// const onePageCount = 35;

export default function Emoji(props) {
  const { emojis = [], onClick, show, pc, onEmojiBlur = () => { }, atTop = true, style } = props;
  const [visible, setVisible] = useState(false);
  // const [page, setPage] = useState([]);
  // const pageCount = [...Array(onePageCount).keys()];
  // useEffect(() => {
  //   const onePage = Math.ceil(emojis.length / onePageCount);
  //   setPage([...Array(onePage).keys()]);
  // }, [emojis]);
  const emojiRef = useRef();

  const computeIsBlur = (e) => {
    if (emojiRef.current?.show && !emojiRef.current.contains(e.currentTarget)) {
      onEmojiBlur();
    }
  };

  useEffect(() => {
    document.addEventListener('click', computeIsBlur);
    return () => {
      document.removeEventListener('click', computeIsBlur);
    };
  }, []);

  useEffect(() => {
    setVisible(show);
    emojiRef.current.show = show;
  }, [show]);

  // if (!visible) return null;

  // const responsive = { mobile: {
  //   breakpoint: { max: 464, min: 0 },
  //   items: 1,
  //   slidesToSlide: 1, // optional, default to 1.
  // },
  // };
  const cls = pc ? styles.pc : styles.h5;
  return (
    <div ref={emojiRef} id="dzq-toolbar-emoji" className={`${styles['dzq-emoji']} ${cls} dzq-toolbar-emoji ${atTop ? '' : styles.atTop}`} style={{ ...style, display: visible ? 'block' : 'none' }} onClick={e => e.stopPropagation()}>
      <div className={styles['dzq-emoji__inner']}>
        {emojis.map(item => <img className={styles['dzq-emoji__icon']}
          alt={item.code}
          key={item.code}
          src={item.url}
          onClick={(e) => { onClick(item) }}
        />)}
      </div>
    </div>
  );
  // return (
  //   <Carousel
  //     /*
  //     swipeable={false}
  //     draggable={false}
  //     */
  //     draggable={true}
  //     showDots={true}
  //     responsive={responsive}
  //     deviceType="mobile"
  //     ssr={true}
  //     infinite={false}
  //     containerClass={`first-carousel-container dzq-toolbar-emoji container ${styles['dzq-emoji']}`}
  //   >
  //     {page.map((item, index) => (
  //       <div className={styles['dzq-emoji__slide']} key={index}>
  //         {pageCount.map((elem, key) => {
  //           const curIndex = (index * onePageCount) + key;
  //           if (curIndex + 1 > emojis.length) return null;
  //           return <img className={styles['dzq-emoji__icon']}
  //             key={emojis[curIndex].code}
  //             src={emojis[curIndex].url}
  //             onClick={(e) => {
  //               e.stopPropagation();
  //               setVisible(false);
  //               onClick(emojis[curIndex]);
  //             }}
  //           />;
  //         })}
  //       </div>
  //     ))}
  //   </Carousel>
  // );
}
