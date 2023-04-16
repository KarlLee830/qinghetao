import React from 'react';
import { inject, observer } from 'mobx-react';
import Taro from '@tarojs/taro';
import { View } from '@tarojs/components';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Avatar from '@components/avatar';
import throttle from '@common/utils/thottle.js';
import { toTCaptcha } from '@common/utils/to-tcaptcha';
import xss from '@common/utils/xss';
import styles from './index.module.scss';

// 用户中心发帖模块
@inject('user')
@inject('site')
@inject('threadPost')
@inject('index')
@inject('comment')
@observer
class UserCenterPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPostDisabled: false // 表示是否禁用发布按钮
    };

    this.ticket = '';
    this.randstr = '';
  }

  componentDidMount() {
    this.handleThreadPostData();
    Taro.eventCenter.on('captchaResult', this.handleCaptchaResult);
    Taro.eventCenter.on('closeChaReault', this.handleCloseChaReault);
  }

  componentWillUnmount() {
    Taro.eventCenter.off('captchaResult', this.handleCaptchaResult);
    Taro.eventCenter.off('closeChaReault', this.handleCloseChaReault);
  }

  // 验证码滑动成功的回调
  handleCaptchaResult = (result) => {
    this.ticket = result.ticket;
    this.randstr = result.randstr;
    if (this.props.comment.captchaMark === `user-post`) {
      this.handleClick();
      this.props.comment.setCaptchaMark('post');
    }
  }

  // 验证码点击关闭的回调
  handleCloseChaReault = () => {
    this.ticket = '';
    this.randstr = '';
  }

  handleChange = (e) => {
    this.props.threadPost?.setPostData({ contentText: e.target.value });
  };

  initState = () => {
    this.setState({
      isPostDisabled: false
    });
  };

  // 获取发帖相关数据
  handleThreadPostData = async () => {
    const { readPostCategory, getCategoriesCanCreate, setCategorySelected, setPostData } = this.props.threadPost;
    const { code, msg } = await readPostCategory();
    if (code !== 0) {
      Toast.error({
        content: msg || '获取发帖分类失败',
      });
      return { success: false, msg };
    }
    // 获取可新建发帖的分类
    const data = getCategoriesCanCreate();
    const parent = data[0] || {};
    const child = !!parent.children?.length ? parent.children[0] : {};
    setCategorySelected({ parent, child });
    setPostData({ categoryId: child.pid || parent.pid });
    return { success: true };
  };

  handleClick = throttle(async () => {
    if (this.state.isPostDisabled) return;
    const { createThread, setPostData, postData } = this.props.threadPost;

    if (!postData.contentText) return Toast.info({ content: '请输入发帖内容' });

    const { webConfig } = this.props.site;
    if (webConfig) {
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      const qcloudCaptchaAppId = webConfig?.qcloud?.qcloudCaptchaAppId;
      const createThreadWithCaptcha = webConfig?.other?.createThreadWithCaptcha;
      if (qcloudCaptcha && createThreadWithCaptcha) {
        if (!this.ticket || !this.randstr) {
          toTCaptcha(qcloudCaptchaAppId);
          return false;
        }
      }
    }

    if (this.ticket && this.randstr) {
      setPostData({
        captchaTicket: this.ticket,
        captchaRandStr: this.randstr,
      });
      this.ticket = '';
      this.randstr = '';
    }

    Toast.loading({
      content: '发布中...',
    });

    // 如果开始没有获取到发帖分类的数据--尝试重新获取
    if (!postData.categoryId) {
      const { success } = await this.handleThreadPostData()
      if (!success) return
    }
    this.setState({
      isPostDisabled: true,
    });
    setPostData({ contentText: xss(postData.contentText) });
    const result = await createThread();
    if (result.code === 0) {
      Toast.success({
        content: '发布成功',
      });
      setPostData({ contentText: '' });
      this.initState();
      this.props.index?.addThread(result.data);
    } else {
      Toast.error({
        content: result.msg || '发布失败',
      });
      this.initState();
    }
  }, 100);

  render() {
    const { user } = this.props;
    return (
      <View className={styles.userCenterPost}>
        <View className={styles.userCenterPostTitle}>发帖</View>
        <View className={styles.userCenterPostContent}>
          <View className={styles.userCenterPostAvatar}>
            <Avatar image={user.avatarUrl} name={user.nickname} circle />
          </View>
          <View style={{ width: '100%' }}>
            <View className={styles.userCenterPostInfo}>
              <View className={styles.userCenterPostInput}>
                <Input style={{ width: '100%' }}
                  placeholder='分享新鲜事'
                  value={this.props.threadPost?.postData?.contentText}
                  onChange={this.handleChange}
                />
              </View>
            </View>
          </View>
        </View>
        <View className={styles.userCenterPostBtn}>
          <Button
            type="primary"
            className={styles.btn}
            disabled={this.state.isPostDisabled}
            onClick={() => {
              this.props.comment.setCaptchaMark('user-post');
              this.handleClick();
            }}
          >
            发布
          </Button>
        </View>
      </View>
    );
  }
}

UserCenterPost.displayName = 'UserCenterPost';

export default UserCenterPost;
