import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import BaseLayout from '@components/base-layout';

@inject('site')
@inject('user')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isTop: false, // 列表位置
      perPage: 20, // 定义每页显示条数
      height: '100%',
    };
  }

  async componentDidMount() {
    this.props.router.events.on('routeChangeStart', this.beforeRouterChange);
    this.setState({
      height: window.outerHeight - 40, // header 是 40px，留出 2px ，用以触发下拉事件
    });
    await this.props.user.getUserShieldList();
  }


  beforeRouterChange = (url) => {
    // 如果不是进入 用户信息 详情页面
    if (!/user\/[0-9]{0,10}/.test(url)) {
      this.props.user.clearUserShield();
    }
  }

  componentWillUnmount() {
    this.props.router.events.off('routeChangeStart', this.beforeRouterChange);
  }

  // 点击屏蔽项去到他人页面
  handleOnClick = (item) => {
    this.props.router.push(`/user/${item.denyUserId}`);
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
      <BaseLayout
        // requestError={this.props.index.threadError.isError}
        // errorText={this.props.index.threadError.errorText}
        pageName={'block'}
        showHeader={true}
        noMore={userShieldTotalPage < userShieldPage}
        onRefresh={this.loadMore}
      >
        {userShield.length > 0 && <div className={styles.titleBox}>{`共有${userShieldTotalCount}位用户`}</div>}
        <div className={styles.blockSplitLine} />
        {userShield.map((item, index) => (
          <div className={styles.haieldImg} key={index}>
            <div
              className={styles.haieldImgBox}
              onClick={() => {
                this.handleOnClick(item);
              }}
            >
              <div className={styles.haieldImgHead}>
                <Avatar className={styles.img} image={item.avatar} name={item.username} userId={item.denyUserId} />
                <p className={styles.haieldName}>{item.nickname}</p>
              </div>
            </div>
          </div>
        ))}
      </BaseLayout>
    );
  }
}

export default withRouter(Index);
