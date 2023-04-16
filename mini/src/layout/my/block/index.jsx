import React from 'react';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import List from '@components/list';
import NoData from '@components/no-data';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import Avatar from '@components/avatar';
import { View } from '@tarojs/components';
import styles from './index.module.scss';

@inject('site')
@inject('user')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTop: false, // 列表位置
      perPage: 20, // 定义每页显示条数
      height: '100vh',
    };
  }

  async componentDidMount() {
    await this.props.user.getUserShieldList();
  }

  componentWillUnmount() {
    this.props.user.clearUserShield();
  }

  // 点击头像去到他人页面
  handleOnClick = (item) => {
    Router.push({ url: `/userPages/user/index?id=${item.denyUserId}` });
  };

  // 加载更多函数
  loadMore = async () => {
    await this.props.user.getUserShieldList();
    return;
  };

  render() {
    const { user } = this.props;
    const { userShield = [], userShieldPage, userShieldTotalCount, userShieldTotalPage } = user || {};
    return (
      <View className={styles.shieldBox}>
        <List
          height={this.state.height}
          onRefresh={this.loadMore}
          hasOnScrollToLower
          noMore={userShieldTotalPage < userShieldPage}
          showLoadingInCenter={!userShield?.length}
        >
          {userShield.length > 0 && <View className={styles.titleBox}>{`共有${userShieldTotalCount}位用户`}</View>}
          <View className={styles.blockSplitLine} />
          {userShield.map((item, index) => (
            <View className={styles.haieldImg} key={index}>
              <View
                className={styles.haieldImgBox}
                onClick={() => {
                  this.handleOnClick(item);
                }}
              >
                <View className={styles.haieldImgHead}>
                  <Avatar className={styles.img} image={item.avatar} name={item.username} userId={item.denyUserId} />
                  <View className={styles.haieldName}>{item.nickname}</View>
                </View>
              </View>
            </View>
          ))}
        </List>
      </View>
    );
  }
}

export default Index;
