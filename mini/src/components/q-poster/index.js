import React, { createRef } from 'react';
import Router from '@discuzqsdk/sdk/dist/router';
import { inject, observer } from 'mobx-react';
import { View, Swiper, SwiperItem, Image } from '@tarojs/components'
import { readThreadPoster } from '@server';
import styles from './index.module.scss';


@inject('site')
@inject('user')
@inject('index')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    	lists:[],
    	loading:true
    }
    this.tabsRef = createRef(null);
    this.headerRef = createRef(null);
    this.isNormal = false
  }

  componentDidMount() {

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

  componentDidUpdate() {
  }

  onClick = (item) => {
    console.log(item)
    if (item.threadId !== '') {
      item.isPositionToComment = false;
      Router.push({url: `/indexPages/thread/index?id=${item.threadId}`})

    } else {
      console.log('帖子不存在');
    }
  }

  render() {
    //const pageData = this.props.pageData?.filter(item => (item.displayTag?.isEssence && item.content?.indexes[101]?.body[0] && item.content?.indexes[101]?.body[0].url))
    return (
      <View>
        {this.state.list && this.state.list.length > 0 &&
          (<Swiper
            className={styles.kujuehuangdeng}
            indicatorColor='#999'
            indicatorActiveColor='#333'
            circular
            interval='5000'
            indicatorDots
            autoplay>
            {this.state.list && this.state.list.map((item, index) => (
              (item.displayTag?.isPoster && item.content?.indexes[101]?.body[0].url) &&
              	(index < 4) &&
              <SwiperItem className={styles.swipercontainer} key={index} onClick={() => this.onClick(item)}>
                <Image className={styles.swiperimg} mode="widthFix" src={item.content?.indexes[101]?.body[0].url}></Image>
              </SwiperItem>
            ))}
          </Swiper>)
        }
        <View className={styles.kujuehuangdeng}></View>
      </View>
    );
  }
};

export default Index;
