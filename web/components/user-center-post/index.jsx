import React from 'react';
import styles from './index.module.scss';
import { Input, Button, Toast } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import Avatar from '@components/avatar';
import throttle from '@common/utils/thottle.js';
import xss from '@common/utils/xss';
import HOCTencentCaptcha from '@middleware/HOCTencentCaptcha';


// 用户中心发帖模块
@inject('site')
@inject('user')
@inject('threadPost')
@inject('index')
@observer
class UserCenterPost extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isPostDisabled: false, // 表示是否禁用发布按钮
    };
  }

  initState = () => {
    this.setState({
      isPostDisabled: false,
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

  componentDidMount() {
    this.handleThreadPostData();
  }

  handleChange = (e) => {
    this.props.threadPost?.setPostData({ contentText: e.target.value });
  };

  handleClick = throttle(async () => {
    const { createThread, setPostData, postData } = this.props.threadPost;
    if (this.state.isPostDisabled) return;
    if (!postData.contentText) return Toast.info({ content: '请输入发帖内容' });

    //  验证码
    const { webConfig } = this.props.site;
    if (webConfig) {
      const qcloudCaptcha = webConfig?.qcloud?.qcloudCaptcha;
      const createThreadWithCaptcha = webConfig?.other?.createThreadWithCaptcha;
      // 开启了腾讯云验证码验证时，进行验证，通过后再进行实际的发布请求

      if (qcloudCaptcha && createThreadWithCaptcha) {
        // 验证码票据，验证码字符串不全时，弹出滑块验证码
        const { captchaTicket, captchaRandStr } = await this.props.showCaptcha();
        if (!captchaTicket && !captchaRandStr) {
          return false ;
        }
        setPostData({captchaTicket, captchaRandStr});
      }
    }

    Toast.loading({
      content: '发布中...',
    });
    // 如果开始没有获取到发帖分类的数据--尝试重新获取
    if (!postData.categoryId) {
      const { success, msg } = await this.handleThreadPostData();
      if (!success) return
    }
    this.setState({
      isPostDisabled: true,
    });
    // 对用户中心的postData.contentText做xss处理
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
  }, 500);

  render() {
    const { site, user } = this.props;
    const { isPC } = site;

    return (
		<>
		  {/*去除快速发帖<div className={classNames(styles.userCenterPost, isPC && styles.pc)}>
			<div className={styles.userCenterPostTitle}>发帖</div>
			<div className={styles.userCenterPostContent}>
			  <div className={styles.userCenterPostAvatar}>
				<Avatar image={user.avatarUrl} name={user.nickname} circle />
			  </div>
			  <div style={{ width: '100%' }}>
				<div className={styles.userCenterPostInfo}>
				  <div className={styles.userCenterPostInput}>
					<Input
					  style={{ width: '100%' }}
					  className={styles.postInput}
					  placeholder={'分享新鲜事'}
					  onChange={this.handleChange}
					  value={this.props.threadPost?.postData?.contentText}
					/>
				  </div>
				</div>
			  </div>
			</div>
			<div className={styles.userCenterPostBtn}>
			  <Button
				type="primary"
				className={styles.btn}
				disabled={this.state.isPostDisabled}
				onClick={this.handleClick}
			  >
				发布
			  </Button>
			</div>
		  </div>*/}
	  </>
    );
  }
}

UserCenterPost.displayName = 'UserCenterPost';

export default HOCTencentCaptcha(UserCenterPost);
