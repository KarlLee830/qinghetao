import React from 'react'
import Taro from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import TaroCanvasDrawer from '../taro-plugin-canvas'; // npm 引入方式
import styles from './index.module.scss'

export default class Simple extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      // 绘图配置文件
      config: null,
      // 绘制的图片
      shareImage: null,
      // TaroCanvasDrawer 组件状态
      canvasStatus: null,
    }
  }
  static getDerivedStateFromProps(props, state) {
    if(props.config && props.config !== state.config) {
      return {
        canvasStatus: true,
        config: props.config
      }
    }
    return null
  }

  componentDidMount() {
    Taro.showLoading({
      title: '绘制中...'
    })
  }

  // 绘制成功回调函数 （必须实现）=> 接收绘制结果、重置 TaroCanvasDrawer 状态
  onCreateSuccess = (result) => {
    const { tempFilePath, errMsg } = result;
    const { setShareImage } = this.props
    setShareImage(tempFilePath)
    Taro.hideLoading();
    if (errMsg === 'canvasToTempFilePath:ok') {
      this.setState({
        // 重置 TaroCanvasDrawer 状态，方便下一次调用
        shareImage: tempFilePath,
        canvasStatus: false,
        config: null
      })
    } else {
      // 重置 TaroCanvasDrawer 状态，方便下一次调用
      this.setState({
        canvasStatus: false,
        config: null
      })
      Taro.showToast({ icon: 'none', title: errMsg || '出现错误' });
    }
  }

  // 绘制失败回调函数 （必须实现）=> 接收绘制错误信息、重置 TaroCanvasDrawer 状态
  onCreateFail = (error) => {
    Taro.hideLoading();
    // 重置 TaroCanvasDrawer 状态，方便下一次调用
    this.setState({
      canvasStatus: false,
      config: null
    })
  }
  preView = () => {
    Taro.previewImage({
      current: this.state.shareImage,
      urls: [this.state.shareImage]
    })
  }
  render() {
    const { experience } = this.props;

    return (
      <View className={styles.painter}>
        <View className={styles.canvanBox}>
        <Image
              className={`${styles.centImage} ${experience && styles.experienceCentImage}`}
              src={this.state.shareImage}
              mode='widthFix'
              lazy-load
              onClick={this.preView}
            />
          {
            this.state.canvasStatus &&
            (
              <View className={styles.boxImg}>
                <TaroCanvasDrawer
                  hidePart = {this.props.hidePart}
                  config={this.state.config} // 绘制配置
                  onCreateSuccess={this.onCreateSuccess} // 绘制成功回调
                  onCreateFail={this.onCreateFail} // 绘制失败回调
                ></TaroCanvasDrawer>
              </View>
            )
          }
        </View>
      </View>
    )
  }
}
