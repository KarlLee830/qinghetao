import React from 'react';
import { inject, observer } from 'mobx-react';
import { setThreadBeUnSticked, setThreadBeSticked } from '@common/store/index/list-business';
import { View } from '@tarojs/components';
import Taro, { getCurrentInstance } from '@tarojs/taro';
import { Icon, ActionSheet, Toast } from '@discuzqsdk/design';
import Thread from '@components/thread';
import styles from './index.module.scss';

const COMMON_ACTIONS = [
  {
    key: 'edit',
    icon: 'CompileOutlined',
    description: '编辑',
  },
  {
    key: 'delete',
    icon: 'DeleteOutlined',
    description: '删除',
  },
];

const TOP_ACTIONS = [
  {
    key: 'top',
    icon: 'TopOutlined',
    description: '置顶',
  },
  ...COMMON_ACTIONS,
];

const UNTOP_ACTIONS = [
  {
    key: 'untop',
    icon: 'TopOutlined',
    description: '取消置顶',
  },
  ...COMMON_ACTIONS,
];

@inject('index')
@inject('search')
@inject('thread')
@inject('threadList')
@inject('site')
@inject('user')
@observer
class UserCenterThreads extends React.Component {
  static defaultProps = {
    showBottomStyle: true,
  };

  constructor(props) {
    super(props);
    this.state = {
      actionSheetVisible: false,
      currentAction: TOP_ACTIONS
    };
  }

  activeThread = null;

  // 置顶处理函数
  topThreadHandler = async () => {
    const thread = this.activeThread;

    const ret = await setThreadBeSticked({
      thread,
      indexStore: this.props.threadList,
    });

    if (ret.success) {
      Toast.success({
        content: '置顶成功',
      });
    } else {
      Toast.error({
        content: ret.msg || '置顶失败',
      });
    }
  };

  // 取消置顶处理函数
  unTopThreadHandler = async () => {
    const thread = this.activeThread;

    const ret = await setThreadBeUnSticked({
      thread,
      indexStore: this.props.threadList,
    });

    if (ret.success) {
      Toast.success({
        content: '取消置顶成功',
      });
    } else {
      Toast.error({
        content: ret.msg || '取消置顶失败',
      });
    }
  };

  // 编辑帖子处理函数
  editThreadHandler = () => {
    const isApproved = this.activeThread.isApproved === 1; // 审核中
    if (!isApproved) {
      Toast.info({ content: '内容正在审核中' });
      return;
    }
    Taro.navigateTo({
      url: `/indexPages/thread/post/index?id=${this.activeThread.threadId}`
    });
  };

  // 删除帖子处理函数
  deleteThreadHandler = async () => {
    const { thread } = this.props;
    this.toastInstance = Toast.loading({
      content: '删除中...',
      duration: 0,
    });
    const res = await thread.delete(this.activeThread.threadId, this.props.index);
    if (res.code === 0) {
      Toast.success({ content: '删除帖子成功' });
    } else {
      Toast.error({ content: res.msg });
    }
  };

  actionSheetSelectHandler = (e, item) => {
    if (e && e.stopPropagation) {
      e.stopPropagation();
    }

    switch (item.key) {
      case 'top':
        this.topThreadHandler();
        break;
      case 'untop':
        this.unTopThreadHandler();
        break;
      case 'edit':
        this.editThreadHandler();
        break;
      case 'delete':
        this.deleteThreadHandler();
        break;
    }

    this.closeActionSheet();
  };

  onActionClick = (e) => {
    e.stopPropagation();
    if (this.activeThread.userStickStatus) {
      this.setState({
        currentAction: UNTOP_ACTIONS,
      });
    } else {
      this.setState({
        currentAction: TOP_ACTIONS,
      });
    }

    this.setState({
      actionSheetVisible: true,
    });
  };

  closeActionSheet = () => {
    this.setState({
      actionSheetVisible: false,
    });
  };

  setTopActions = () => {
    this.setState({
      currentAction: TOP_ACTIONS
    });
  };

  setUnTopActions = () => {
    this.setState({
      currentAction: UNTOP_ACTIONS
    });
  };

  isOtherThreads = () => {
    const { id = '' } = getCurrentInstance()?.router?.params || {};

    return id;
  };

  renderExtraTag = (itemInfo) => {
    if (this.isOtherThreads()) {
      return null;
    }

    const spanElement = (
      <View
        onClick={(e) => {
          this.activeThread = itemInfo;
          this.onActionClick(e);
        }}
      >
        <Icon name="MoreBOutlined" />
      </View>
    );

    return spanElement;
  };

  renderActionSheet = () => {
    if (this.isOtherThreads()) {
      return null;
    }

    return (
      <ActionSheet
        visible={this.state.actionSheetVisible}
        layout="row"
        actions={this.state.currentAction}
        onSelect={this.actionSheetSelectHandler}
        onClose={this.closeActionSheet}
      />
    );
  };

  renderExtraInfo = (thread) => {
    if (!thread.userStickStatus) {
      return null;
    }

    return (
      <View className={styles.threadStickFlag}>
        <Icon name="TopOutlined" size={12} />
      </View>
    );
  };

  render() {
    return (
      <View>
        {this.props.data.map((itemInfo, index) => (
          <View key={index} className={index === 0 ? styles.threadFirstItem : styles.threadItem}>
            {this.renderExtraInfo(itemInfo)}
            <Thread
              key={`${itemInfo.threadId}-${itemInfo.updatedAt}-${itemInfo.user.avatar}`}
              showBottomStyle={this.props.showBottomStyle}
              extraTag={this.renderExtraTag(itemInfo)}
              data={itemInfo}
            />
          </View>
        ))}
        {this.renderActionSheet()}
      </View>
    );
  }
}

export default UserCenterThreads;
