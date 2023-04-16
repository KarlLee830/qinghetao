import React, { Component } from 'react';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import UserCenterHeaderImage from '@components/user-center-header-images';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Input from '@discuzqsdk/design/dist/components/input/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import { inject, observer } from 'mobx-react';
import { ACCEPT_IMAGE_TYPES } from '@common/constants/thread-post';
import { View, Text, Canvas } from '@tarojs/components';
import locals from '@common/utils/local-bridge';
import getConfig from '@common/config';
import constants from '@common/constants';
import Toast from '@discuzqsdk/design/dist/components/toast';
import { updateMyThreadAvatar } from '@common/store/thread-list/list-business';

@inject('user')
@inject('threadList')
@observer
export default class index extends Component {
  config = {};

  constructor(props) {
    super(props);
    this.state = {
      isClickSignature: false, // 是否点击签名
      isUploadAvatarUrl: false, // 是否上传头像
      isUploadBackgroundUrl: false, // 是否上传背景图片
      inputWidth: '100%',
      canvasHeight: 0,
      canvasWidth: 0,
    };
    this.config = getConfig();
    this.user = this.props.user || {};
    this.hiddenElement = React.createRef();
  }

  onChooseAvatar = (e) => {
    const { avatarUrl } = e.detail
    console.log(avatarUrl)
    this.onAvatarChange(avatarUrl);
  };

  handleAvatarUpload = () => {
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        console.log(res.tempFiles)
        this.onAvatarChange(res.tempFiles);
      },
    });
  };

  handleBackgroundUpload = () => {
    Taro.chooseImage({
      count: 1,
      success: (res) => {
        this.onBackgroundChange(res.tempFiles);
      },
    });
  };

  getCanvasImg = async (file) => {
    const imgInfo = await Taro.getImageInfo({
      src: file.path,
    });
    const canvasContext = Taro.createCanvasContext('photoCanvas', this.$scope);
    let canvasHeight, canvasWidth;
    if (imgInfo && imgInfo.orientation) {
      const { width, height } = imgInfo;
      canvasHeight = height;
      canvasWidth = width;

      this.setState({
        canvasHeight,
        canvasWidth,
      });

      const img = file.path;

      switch (imgInfo.orientation) {
        case 'down':
          canvasWidth = width;
          canvasHeight = height;
          //需要旋转180度
          this.setState({
            canvasWidth: width,
            canvasHeight: height,
          });
          canvasContext.translate(width / 2, height / 2);
          canvasContext.rotate((180 * Math.PI) / 180);
          canvasContext.drawImage(img, -width / 2, -height / 2, width, height);
          break;
        case 'left':
          canvasWidth = width;
          canvasHeight = height;
          canvasContext.translate(height / 2, width / 2);
          this.setState({
            canvasWidth: height,
            canvasHeight: width,
          });
          //顺时针旋转270度
          canvasContext.rotate((270 * Math.PI) / 180);
          canvasContext.drawImage(img, -width / 2, -height / 2, width, height);
          break;
        case 'right':
          // canvasWidth = width;
          // canvasHeight = height;
          // this.setState({
          //   canvasWidth: height,
          //   canvasHeight: width,
          // });
          // //顺时针旋转90度
          // canvasContext.rotate((90 * Math.PI) / 180);
          // canvasContext.drawImage(img, -width / 2, -height / 2, width, height);
          canvasHeight = height;
          canvasWidth = width;
          canvasContext.drawImage(img, 0, 0);
          break;
        default:
          canvasHeight = height;
          canvasWidth = width;
          canvasContext.drawImage(img, 0, 0);
      }
    }

    const drawPromisify = () =>
      new Promise((resolve) => {
        canvasContext.draw(false, () => {
          Taro.canvasToTempFilePath({
            canvasId: 'photoCanvas',
            width: canvasWidth,
            height: canvasHeight,
            destWidth: canvasWidth,
            destHeight: canvasHeight,
            x: 0,
            y: 0,
            success: (res) => {
              resolve(res);
            },
            fail: (err) => {
              console.error('failed', err);

              Toast.error({
                content: '图像转换失败',
                duration: 2000,
              });
            },
            onError: (err) => {
              console.error('error', err);

              Toast.error({
                content: '图像转换错误',
                duration: 2000,
              });
            },
          });
        });
      });

    const res = await drawPromisify();

    return res;
  };

  uploadAvatarImpl = async (fileList) => {
    try {
      const token = locals.get(constants.ACCESS_TOKEN_NAME);
      // const file = await this.getCanvasImg(fileList[0]);
      const uploadRes = await Taro.uploadFile({
        url: `${this.config.COMMON_BASE_URL}/api/v3/users/avatar`,
        filePath: fileList,
        header: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${token}`,
        },
        name: 'avatar',
      });
      try {
        const parsedData = JSON.parse(uploadRes.data);
        if (parsedData.Code === 0) {
          Toast.success({
            content: '上传头像成功',
            hasMask: false,
            duration: 2000,
          });
          this.setState({
            isUploadAvatarUrl: false,
          });
          this.props.user.userInfo.avatarUrl = parsedData.Data.avatarUrl;
          this.props.user.userInfo = { ...this.props.user.userInfo };
          updateMyThreadAvatar({
            avatarUrl: parsedData.Data.avatarUrl,
            threadList: this.props.threadList,
          });
        } else {
          Toast.error({
            content: parsedData.Message || '上传头像失败',
            hasMask: false,
            duration: 2000,
          });
          this.setState({
            isUploadAvatarUrl: false,
          });
        }
      } catch (e) {
        console.error(e);
        Toast.error({
          content: '解析失败',
          duration: 2000,
        });
        this.setState({
          isUploadAvatarUrl: false,
        });
      }
    } catch (e) {
      console.error(e);
      Toast.error({
        content: '上传失败，网络错误',
        duration: 2000,
      });
      this.setState({
        isUploadAvatarUrl: false,
      });
    }
  };

  uploadBackgroundImpl = async (fileList) => {
    try {
      const token = locals.get(constants.ACCESS_TOKEN_NAME);
      // const file = await this.getCanvasImg(fileList[0]);
      const uploadRes = await Taro.uploadFile({
        url: `${this.config.COMMON_BASE_URL}/api/v3/users/background`,
        filePath: fileList[0].path,
        header: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${token}`,
        },
        name: 'background',
      });
      try {
        const parsedData = JSON.parse(uploadRes.data);
        if (parsedData.Code === 0) {
          Toast.success({
            content: '上传成功',
            hasMask: false,
            duration: 2000,
          });
          this.setState({
            isUploadBackgroundUrl: false,
          });
          this.props.user.userInfo.backgroundUrl = parsedData.Data.backgroundUrl;
          this.props.user.userInfo = { ...this.props.user.userInfo };
        } else {
          Toast.error({
            content: parsedData.Message || '上传背景图片失败',
            duration: 2000,
          });
          this.setState({
            isUploadBackgroundUrl: false,
          });
        }
      } catch (e) {
        console.log(e);
        Toast.error({
          content: '解析失败',
          duration: 2000,
        });
        this.setState({
          isUploadBackgroundUrl: false,
        });
      }
    } catch (e) {
      console.log(e);
      Toast.error({
        content: '上传失败，网络错误',
        duration: 2000,
      });
      this.setState({
        isUploadBackgroundUrl: false,
      });
    }
  };

  onAvatarChange = async (fileList) => {
    this.setState({
      isUploadAvatarUrl: true,
    });
    await this.uploadAvatarImpl(fileList);
  };

  onBackgroundChange = async (fileList) => {
    this.setState({
      isUploadBackgroundUrl: true,
    });
    await this.uploadBackgroundImpl(fileList);
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

  getStatusBarHeight() {
    return wx?.getSystemInfoSync()?.statusBarHeight || 44;
  }

  // 全屏状态下自定义左上角返回按钮位置
  getTopBarBtnStyle() {
    return {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '12px',
      transform: 'translate(0, 10px)',
    };
  }

  getTopBarTitleStyle() {
    return {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '50%',
      transform: 'translate(-50%, 8px)',
    };
  }

  // 渲染顶部title
  renderTitleContent = () => {
    return (
      <View className={styles.topBar}>
        <View style={this.getTopBarTitleStyle()} className={styles.fullScreenTitle}>
          编辑资料
        </View>
      </View>
    );
  };

  render() {
    const { isUploadAvatarUrl, isUploadBackgroundUrl, inputWidth } = this.state;
    return (
      <>
        <View className={styles.userCenterEditHeader}>
          {this.renderTitleContent()}
          <View className={styles.bgContent}>
            <UserCenterHeaderImage onClick={this.handleBackgroundUpload} />
            {/* 背景图加载状态 */}
            {isUploadBackgroundUrl && (
              <View className={styles.uploadBgUrl}>
                <Icon name="UploadingOutlined" size={12} />
                <Text className={styles.uploadText}>上传中...</Text>
              </View>
            )}
          </View>
          <View className={styles.headImgBox}>
            <Avatar image={this.user.avatarUrl} size="big" name={this.user.nickname} />
            {/* 相机图标 */}
            <Button className={styles.userCenterEditCameraIcon}
                    openType="chooseAvatar"
                    onChooseavatar={this.onChooseAvatar}>
              <Icon name="CameraOutlined" />
            </Button>
            {/* 上传中样式处理 */}
            {isUploadAvatarUrl && (
              <View className={styles.uploadAvatar}>
                <Icon name="UploadingOutlined" size={12} />
                <Text className={styles.uploadText}>上传中...</Text>
              </View>
            )}
          </View>
          {/* 编辑修改说明 */}
          <View className={styles.userCenterEditDec}>
            <View className={styles.userCenterEditDecItem}>
              <Icon className={styles.compileIcon} onClick={this.handleClickSignature} name="CompileOutlined" />
              {this.state.isClickSignature ? (
                <View style={{ width: inputWidth + 10, minWidth: !this.user.editSignature && '180px' }}>
                  <Input
                    className={styles.userSignatureInput}
                    maxLength={50}
                    focus={true}
                    onChange={this.handleChangeSignature}
                    onBlur={this.handleBlurSignature}
                    value={this.user.editSignature}
                    placeholder="这个人很懒，什么也没留下~"
                  />
                </View>
              ) : (
                <View style={{ minWidth: !this.user.editSignature && '180px' }} className={styles.text}>
                  {this.user.editSignature || '这个人很懒，什么也没留下~'}
                </View>
              )}
              {/* 隐藏span--获取该内容宽度--赋值给input */}
              <View style={{ maxWidth: '80%' }} ref={this.hiddenElement} className={styles.hiddenElement}>
                {this.user.editSignature || '这个人很懒，什么也没留下~'}
              </View>
            </View>
          </View>
          <Canvas
            type="33"
            canvasId={'photoCanvas'}
            style={{
              visibility: 'hidden',
              position: 'fixed',
              top: 0,
              zIndex: -10000,
              width: this.state.canvasWidth,
              height: this.state.canvasHeight,
            }}
          />
        </View>
      </>
    );
  }
}
