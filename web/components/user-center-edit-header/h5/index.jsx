import React, { Component } from 'react';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import UserCenterHeaderImage from '@components/user-center-header-images';
import { Icon, Input, Toast } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import { USER_IMAGE_TYPES } from '@common/constants/user-center-image-pattern';
import { fixImageOrientation } from '@common/utils/exif';
import { detectImageAutomaticRotation } from '@common/utils/detect-image-automatic-rotation';

@inject('user')
@observer
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isClickSignature: false, // 是否点击签名
      isUploadAvatarUrl: false, // 是否上传头像
      isUploadBackgroundUrl: false, // 是否上传背景图片
      inputWidth: '100%',
    };
    this.user = this.props.user || {};
    this.hiddenElement = React.createRef(null);
  }

  componentDidMount() {
    // this.user.initEditInfo()
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
    let fixedImg;

    const IS_IMG_AUTO_ROTATE = await detectImageAutomaticRotation();

    fixedImg = await fixImageOrientation(fileList.target.files[0]);
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
      inputWidth: this.hiddenElement.current?.offsetWidth,
    });
  };

  // 签名change事件
  handleChangeSignature = (e) => {
    this.props.user.editSignature = e.target.value;
    this.setState({
      inputWidth: this.hiddenElement.current?.offsetWidth,
    });
  };

  handleBlurSignature = (e) => {
    this.props.user.editSignature = e.target.value.trim();
    this.setState({
      isClickSignature: false,
    });
  };

  render() {
    const { isUploadAvatarUrl, isUploadBackgroundUrl, inputWidth } = this.state;
    return (
      <>
        <div className={styles.userCenterEditHeader}>
          <div className={styles.bgContent}>
            <UserCenterHeaderImage onClick={this.handleBackgroundUpload} />
            <input
              onChange={this.onBackgroundChange}
              ref={this.backgroundUploaderRef}
              type="file"
              style={{ display: 'none' }}
              accept={USER_IMAGE_TYPES.join(',')}
            />
            {/* 背景图加载状态 */}
            {isUploadBackgroundUrl && (
              <div className={styles.uploadBgUrl}>
                <Icon name="UploadingOutlined" size={12} />
                <span className={styles.uploadText}>上传中...</span>
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
                accept={USER_IMAGE_TYPES.join(',')}
              />
            </div>
            {/* 上传中样式处理 */}
            {isUploadAvatarUrl && (
              <div className={styles.uploadAvatar}>
                <Icon name="UploadingOutlined" size={12} />
                <span className={styles.uploadText}>上传中...</span>
              </div>
            )}
          </div>
          {/* 编辑修改说明 */}
          <div className={styles.userCenterEditDec}>
            <div className={styles.userCenterEditDecItem}>
              <Icon className={styles.compileIcon} onClick={this.handleClickSignature} name="CompileOutlined" />
              {this.state.isClickSignature ? (
                // true ? (
                <div style={{ width: inputWidth + 10, minWidth: !this.user.editSignature && '180px' }}>
                  <Input
                    className={styles.userSignatureInput}
                    maxLength={50}
                    focus={true}
                    onChange={this.handleChangeSignature}
                    onBlur={this.handleBlurSignature}
                    value={this.user.editSignature}
                    placeholder="这个人很懒，什么也没留下~"
                  />
                </div>
              ) : (
                <div style={{ minWidth: !this.user.editSignature && '180px' }} className={styles.text}>
                  {this.user.editSignature || '这个人很懒，什么也没留下~'}
                </div>
              )}
              {/* 隐藏span--获取该内容宽度--赋值给input */}
              <div style={{ maxWidth: '80%' }} ref={this.hiddenElement} className={styles.hiddenElement}>
                {this.user.editSignature || '这个人很懒，什么也没留下~'}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }
}
