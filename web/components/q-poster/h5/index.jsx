import React from 'react';
import { withRouter } from 'next/router';
import { RichText } from '@discuzqsdk/design';
import styles from './index.module.scss';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import { Carousel } from 'antd';
// 引入antdesgin
import 'antd/dist/antd.css';
/**
 * 置顶消息
 * @prop {{prefix:string, title:string}[]} data
 */
const pc = ({ data = [], router, platform = 'h5'}) => {
  const onClick = ({ threadId } = {}, e) => {
    if (e?.target?.localName === 'a') {
      return
    }
    router.push(`/thread/${threadId}`);
  };

  // 过滤内容
  const filterContent = (content) => {
    let newContent = content ? s9e.parse(content) : '暂无内容';
    newContent = xss(newContent);

    return newContent;
  };

  const handlerTitle = (title = '') => {
    if (platform = 'h5' && title.length > 20) {
      return `${title.slice(0, 20)}...`
    }
    return title
  }
  
  const contentStyle = {
    width: '100%',
    color: '#fff',
    textAlign: 'center',
    background: '#364d79',
	
  };

  return (
    <div className={styles.list}>
	  <Carousel autoplay>
      {data?.map((item, index) => (
        (item.displayTag?.isEssence && item.content?.indexes[101]?.body[0].url) &&
		    (index < 4) &&
			<div
			  key={index}
			  onClick={() => onClick(item)}
			>
			  <div className={styles.bodyimg}>
			    {item.displayTag.isEssence}
			    <img style={contentStyle} src={item.content?.indexes[101]?.body[0].url}/>
			  </div>
			</div>
      ))}
	  </Carousel>
    </div>
  );
};

export default withRouter(pc);
