/**
 * 定位组件
 */
import React, { memo, useState, useEffect } from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Taro from '@tarojs/taro';

const Index = (props) => {
  const { currentPosition = {}, positionChange = () => { }, canJumpToChoose = () => true } = props;

  // 是否已经选择定位
  const [isChose, setIsChose] = useState(false);
  // 当前定位
  const [position, setPosition] = useState({});


  useEffect(() => {
    if (currentPosition.latitude && currentPosition.latitude !== position.latitude) {
      setPosition(currentPosition);
      setIsChose(true);
    }
  }, [currentPosition]);

  // 选择定位
  const chooseLocation = () => {
    if (!canJumpToChoose()) return;
    Taro.authorize({
      scope: 'scope.userLocation',
      success: function () {
        // 用户已经同意小程序使用定位功能，后续调用 Taro.chooseLocation 接口不会弹窗询问
        Taro.chooseLocation({
          ...position,
          success(ret) {
            const _position = {
              ...ret,
              location: ret.name,
            }
            setPosition(_position);
            setIsChose(true);
            positionChange(_position);
          }
        });
      },
      fail: function (err) {
        if (err?.errMsg?.indexOf('auth deny') > -1) {
          Toast.info({ content: '请在小程序页面右上角 - 更多 - 设置里允许小程序使用定位权限~' });
        }
      }
    });
  };

  // 删除定位
  const removeLocation = () => {
    setPosition({});
    setIsChose(false);
    positionChange({});
  };


  return (
    <View onClick={chooseLocation} className={classNames(styles['position'], {
      [styles['chose']]: isChose,
    })}>
      <Icon className={styles['position-icon']} name='PositionOutlined' size={12} />
      <Text
        className={styles['text']}
        style={position.location ? {} : { paddingRight: '8px' }}
      >{position.location || '你在哪里？'}</Text>
      {isChose && <Icon className={styles['remove-icon']} name='CloseOutlined' size={10} onClick={(e) => {
        removeLocation();
        e.stopPropagation();
        return false;
      }} />}
    </View>
  );
};

Index.propTypes = {
  /**
   * 位置变化的回调
   */
  positionChange: PropTypes.func,

  currentPosition: PropTypes.object,
};


export default memo(Index);
