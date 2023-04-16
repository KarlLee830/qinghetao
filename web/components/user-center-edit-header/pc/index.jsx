import React, { Component } from 'react';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import UserCenterHeaderImage from '@components/user-center-header-images';
import { Icon, Input, Toast } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import { ACCEPT_IMAGE_TYPES } from '@common/constants/thread-post';
import { fixImageOrientation } from '@common/utils/exif';
import Router from '@discuzqsdk/sdk/dist/router';

@inject('user')
@observer
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isClickSignature: false,
      isUploadAvatarUrl: false, // 是否上传头像
      isUploadBackgroundUrl: false, // 是否上传背景图片
    };
    this.user = this.props.user || {};
  }

  avatarUploaderRef = React.createRef(null);
  backgroundUploaderRef = React.createRef(null);

  handleAvatarUpload = () => {
    this.avatarUploaderRef.current.click();
  };

  handleBackgroundUpload = () => {
    this.backgroundUploaderRef.current.click();
  };

  onAvatarChange = async (fileList) => {
    if (!fileList.target.files[0]) return;
    this.setState({
      isUploadAvatarUrl: true,
    });
    let fixedImg = await fixImageOrientation(fileList.target.files[0]);
    this.props.user
      .updateAvatar(fixedImg)
      .then((res) => {
        const id = this.user.id;
        if (id === res.id && res.avatarUrl) {
          // this.user.editAvatarUrl = res.avatarUrl;
          Toast.success({
            content: '上传头像成功',
            hasMask: false,
            duration: 2000,
          });
          this.setState({
            isUploadAvatarUrl: false,
          });
        }
      })
      .catch((err) => {
        Toast.error({
          content: err.Msg || '上传头像失败',
          hasMask: false,
          duration: 2000,
        });
        this.setState({
          isUploadAvatarUrl: false,
        });
        // 上传失败 应该取之前用户的头像
        // this.user.editAvatarUrl = this.user.avatarUrl;
      });
  };

  onBackgroundChange = async (fileList) => {
    if (!fileList.target.files[0]) return;
    this.setState({
      isUploadBackgroundUrl: true,
    });
    let fixedImg = await fixImageOrientation(fileList.target.files[0]);
    this.props.user
      .updateBackground(fixedImg)
      .then((res) => {
        const id = this.user.id;
        if (id === res.id && res.backgroundUrl) {
          Toast.success({
            content: '上传成功',
            hasMask: false,
            duration: 2000,
          });
          this.setState({
            isUploadBackgroundUrl: false,
          });
        }
      })
      .catch((err) => {
        Toast.error({
          content: err.Msg || '上传背景图失败',
          hasMask: false,
          duration: 2000,
        });
        this.setState({
          isUploadBackgroundUrl: false,
        });
      })
      .finally(() => {
        this.backgroundUploaderRef.current.value = '';
      });
  };

  // 点击编辑签名
  handleClickSignature = () => {
    this.setState({
      isClickSignature: !this.state.isClickSignature,
    });
  };

  // 签名change事件
  handleChangeSignature = (e) => {
    this.props.user.editSignature = e.target.value;
  };

  handleBlurSignature = (e) => {
    this.props.user.editSignature = e.target.value.trim();
    this.setState({
      isClickSignature: false,
    });
  };

  render() {
    const { isUploadAvatarUrl, isUploadBackgroundUrl } = this.state;
    return (
      <>
        <div className={styles.userCenterEditHeader}>
          <div className={styles.bgContent}>
            <UserCenterHeaderImage className={styles.userCenterEditHeaderImg} onClick={this.handleBackgroundUpload} />
            <input
              onChange={this.onBackgroundChange}
              ref={this.backgroundUploaderRef}
              type="file"
              style={{ display: 'none' }}
            />
            {/* 背景图加载状态 */}
            {isUploadBackgroundUrl && (
              <div className={styles.uploadBgUrl}>
                <div className={styles.uploadCon}>
                  <Icon name="UploadingOutlined" size={12} />
                  <span className={styles.uploadText}>上传中...</span>
                </div>
              </div>
            )}
          </div>
          <div className={styles.headImgBox}>
            <Avatar wrapClassName={styles.avatarWrap} image={this.user.avatarUrl} size="big" name={this.user.nickname} />
            {/* 相机图标 */}
            <div className={styles.userCenterEditCameraIcon} onClick={this.handleAvatarUpload}>
              <Icon name="CameraOutlined" />
              <input
                onChange={this.onAvatarChange}
                ref={this.avatarUploaderRef}
                type="file"
                style={{ display: 'none' }}
                multiple={false}
                accept={ACCEPT_IMAGE_TYPES.join(',')}
              />
            </div>
            {isUploadAvatarUrl && (
              <div className={styles.uploadAvatar}>
                <Icon name="UploadingOutlined" size={12} />
                <span className={styles.uploadText}>上传中...</span>
              </div>
            )}
          </div>
          {/* 上传封面图 */}
          <div className={styles.userCenterupload} onClick={this.handleBackgroundUpload}>
            <Icon name="UploadingOutlined" size={12} className={styles.userCenteruploadIcon} />
            上传封面图片
          </div>
          {/* 返回我的主页 */}
          <div
            className={`${styles.userCenterReturn} ${styles.userCenterupload}`}
            onClick={() => {
              Router.back();
            }}
          >
            <Icon name="ReturnOutlined" size={16} className={styles.userCenterReturnIcon} />
            返回我的主页
          </div>
          {/* 编辑修改说明 */}
          <div className={styles.userCenterEditDec}>编辑资料</div>
        </div>
      </>
    );
  }
}
