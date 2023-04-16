import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import { View } from '@tarojs/components';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Avatar from '@discuzqsdk/design/dist/components/avatar/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Checkbox from '@discuzqsdk/design/dist/components/checkbox/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import styles from './index.module.scss';
import MemberBadge from '@components/member-badge';

import List from '@components/list';

import stringToColor from '@common/utils/string-to-color';

@inject('threadPost')
@inject('search')
@inject('thread')
@observer
class AtSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keywords: '', // 搜索关键字
      checkUser: [], // 当前选择的at用户列表
      page: 1,
      perPage: 20,
      finish: false, // 粉丝列表加载结束
    };
    this.timer = null;
  }

  componentDidMount() { // 初始化
    this.fetchFollow();
  }

  // 请求粉丝
  async fetchFollow() {
    const { threadPost } = this.props;
    const { page, perPage } = this.state;
    const ret = await threadPost.fetchFollow({ page, perPage });
    if (ret?.code === 0) {
      this.setState({
        page: page + 1,
        finish: page * perPage >= threadPost.followsTotalCount,
      });
    } else {
      this.setState({ finish: true })
      Taro.showToast({ title: ret.msg, icon: 'none' })
    }
  }

  // 请求全站用户
  async fetchUserList() {
    const { getUsersList } = this.props.search;
    const { page, perPage, keywords } = this.state;
    const params = { search: keywords, type: 'nickname', page, perPage };
    const ret = await getUsersList(params);
    const { code, data } = ret;
    if (code === 0) {
      this.setState({
        page: keywords === this.state.keywords ? page + 1 : 1,
        finish: page * perPage >= data?.totalCount,
      });
    } else {
      this.setState({ finish: true });
      Taro.showToast({ title: ret.msg, icon: 'none' })
    }
  }

  // 更新搜索关键字,搜索用户
  updateKeywords = (val = "") => {
    this.setState({
      keywords: val,
      // checkUser: [], 此处不清理已选项
      page: 1,
      finish: false,
    });
    this.searchInput();
  }

  // 搜索用户
  searchInput() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.onScrollBottom();
    }, 300);
  }

  onScrollBottom = () => {
    return this.state.keywords ? this.fetchUserList() : this.fetchFollow();
  }

  // 取消选择
  handleCancel = () => {
    if (typeof this.props.onCancel === 'function') {
      this.props.onCancel();
      return;
    }
    Taro.navigateBack();
  };

  // 确认选择
  submitSelect = () => {
    const { checkUser } = this.state;
    // 未选@人，不操作
    if (checkUser.length === 0) return;

    //判断是否为详情页进入的
    const data = getCurrentInstance().router.params;
    if (data?.type === 'thread') {
      this.props.thread.setCheckUser(checkUser);
      // 返回详情页
      this.handleCancel();
      return;
    }

    // 外部选择事件
    if (typeof this.props.getAtList === 'function') {
      this.props.getAtList(checkUser);
    }

    if (!this.props.stateLess) {
      // 处理已选@ren，更新store
      const {
        postData: { contentText: text },
        setPostData,
        cursorPosition,
        setCursorPosition,
      } = this.props.threadPost;
      const at = checkUser.map((item) => `@${item} `).join(' ');
      const contentText = text.slice(0, cursorPosition) + at + text.slice(cursorPosition);
      setPostData({ contentText });
      setCursorPosition(cursorPosition + at.length);
    }

    // 返回发帖页
    this.handleCancel();
  }

  // 获取显示文字头像的背景色
  getBackgroundColor = (name) => {
    const character = name ? name.charAt(0).toUpperCase() : "";
    return stringToColor(character);
  }

  formatData = (item) => {
    const isFollow = this.state.keywords === '';
    const avatar = isFollow ? item?.user?.avatar : item.avatar;
    const username = isFollow ? item?.user?.userName : item.username;
    const nickname = isFollow ? item?.user?.nickname : item.nickname;
    const groupName = isFollow ? item?.group?.groupName : item.groupName;
    const level = isFollow ? item?.group?.level : item.level;
    const userId = isFollow ? item.user?.userId : item.userId;
    return { avatar, username, groupName, level, userId, nickname };
  }

  // 渲染列表内容
  renderItem() {
    const { threadPost, search } = this.props;
    const data = this.state.keywords ? (search?.users?.pageData || []) : (threadPost.follows || []);

    if (data.length === 0) return null;
    return data.map(item => {
      const { avatar, nickname, groupName, userId, level } = this.formatData(item);
      return (
        <View className={styles['at-item']} key={userId}>
          <View className={styles['at-item__inner']} >
            <Checkbox name={nickname}>
              <View className={styles.avatar}>
                {avatar
                  ? <Avatar image={avatar} />
                  : <Avatar
                    text={nickname.toUpperCase()}
                    style={{
                      backgroundColor: `#${this.getBackgroundColor(nickname)}`
                    }}
                  />
                }
              </View>
              <View className={styles.info}>
                <View className={styles.username}>{nickname}</View>
                {
                  level ?
                  <MemberBadge
                    className={styles.group}
                    groupLevel={level}
                    groupName={groupName}
                  />
                  :
                  <View className={styles.group}>{groupName}</View>
                }
              </View>
            </Checkbox>
          </View>
        </View>
      )
    })
  }

  render() {
    const { keywords, checkUser, finish } = this.state;

    return (
      <View className={styles.wrapper}>
        {/* top */}
        <View className={styles.header}>
          <View className={styles['input-box']}>
            <View className={styles['icon-box']}>
              <Icon className={styles['search-icon']} name="SearchOutlined" size={16}></Icon>
            </View>
            <Input
              value={keywords}
              placeholder='选择好友或直接输入圈友'
              onChange={e => this.updateKeywords(e.target.value)}
            />
            {keywords &&
              <View className={styles['icon-box']} onClick={() => this.updateKeywords()}>
                <Icon className={styles['delete-icon']} name="WrongOutlined" size={16}></Icon>
              </View>
            }
          </View>
          <View className={styles['btn-cancel']} onClick={this.handleCancel}>取消</View>
        </View>

        {/* list */}
        <Checkbox.Group
          className={styles['check-box']}
          value={checkUser}
          onChange={val => this.setState({ checkUser: val })}
        >
          <List
            className={styles.list}
            noMore={finish}
            onRefresh={this.onScrollBottom}
            hasOnScrollToLower={true}
          >
            {this.renderItem()}
          </List>
        </Checkbox.Group>

        {/* 确认按钮 */}
        <View className={styles['btn-container']}>
          <Button
            className={checkUser.length > 0 ? styles.selected : ''}
            onClick={() => this.submitSelect()}
          >
            {checkUser.length ? `@ 已选 (${checkUser.length})` : '尚未选'}
          </Button>
        </View>
      </View >
    );
  }
}

export default AtSelect;
