import React, { useEffect }  from 'react';
import styles from './index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';
import { Flex, Spin, Divider, Toast, Icon, Button, ImagePreviewer } from '@discuzqsdk/design';
import { readThreadPoster } from '@server';
import { Carousel } from '@arco-design/mobile-react';

import '@arco-design/mobile-react/dist/style.min.css';
//import '@arco-design/mobile-react/esm/button/style';
//import '@arco-design/mobile-react/esm/style';
//import { Carousel } from '@arco-design/web-react';

//import { Swiper } from 'tdesign-mobile-react';
//import 'tdesign-mobile-react/es/style/index.css'; // 少量公共样式
// 引入
//import '@arco-design/web-react/dist/css/arco.css';
// 引入antdesgin
//import 'antd/dist/antd.css';
//import 'antd/lib/carousel/style/index.css';
//import { Carousel } from '@arco-design/web-react';
// 引入
//import { Carousel } from 'antd';
//import '@arco-design/web-react/dist/css/arco.css';
/**

 */
class Index extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
			lists:[],
			loading:true
		}
	}
  componentWillMount() {
  	
  	readThreadPoster({
  		params: {
  			page: 1
  		},
  	}).then((res) => {
  		console.log(res)
  		this.setState({
  			loading:false,
  			list:res.data.pageData
  		})
  	});
  	console.log('readThreadPoster')
  	console.log(this.state.list)
  }
  gothead = (tid) => {
  	Router.push({url: `/thread/${tid}`});
  }
  renderPoset = () => {
	const component = this.state.list?.length > 0 && (
	  <>
	    <div className={styles.list}>
	      <Carousel 
	        indicatorType="circle" 
	    	lazyloadCount={1}
	      >
	    	{
	    		this.state.list && this.state.list.map((item, index) => (
	    			(item.displayTag?.isPoster && item.content?.indexes[101]?.body[0].url) &&
	    				(index < 4) &&
	    					<div className={styles.bodyimg}  key={index} onClick={()=>this.gothead(item.threadId)}>
	    						<img src={item.content?.indexes[101]?.body[0].url} />
	    					</div>
	    			
	    		))
	    	}
	      </Carousel>
	    </div>
	  </>
	);
	return (
	  <div style={{ height: '100%' }}>
	    {component}
	  </div>
	);
  };
  render() {
	  return (
		  <>
			{this.renderPoset()}
		  </>
	  );
  }
};

export default Index;
