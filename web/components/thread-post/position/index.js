/**
 * 发帖-选择位置
 * @prop {object} position 输入位置对象
 * @prop {string} key 腾讯位置服务key值
 * @prop {object} router 当前路由对象
 * @prop {function} onChange 监听位置改变事件
 */
import React, { useState, useEffect } from 'react';
import { Tag, Icon, Toast } from '@discuzqsdk/design';
import classNames from 'classnames';
import styles from './index.module.scss';

import MapDialog from './../map-dialog';

import PropTypes from 'prop-types';

const Index = (props) => {
  const { position, lbskey, onChange } = props;

  const [mapUrl, setMapUrl] = useState(''); // 地图组件中iframe的src属性值
  const [isShowMap, toggleIsShowMap] = useState(false); // 切换地图显示、隐藏

  useEffect(() => {
    lbskey && updateMapUrl(position);
  }, [position]);

  const updateMapUrl = (newPosition) => { // 更新位置选点地址
    let newMapUrl = `https://apis.map.qq.com/tools/locpicker?search=1&type=1&key=${lbskey}&referer=myapp`
    if (Object.keys(newPosition).length > 0) {
      const coord = `${newPosition.latitude},${newPosition.longitude}`;
      newMapUrl = `${newMapUrl}&coord=${coord}`;
    }

    setMapUrl(newMapUrl);
  }

  const openMap = async () => {
    if (!lbskey) {
      Toast.error({ content: '请检查配置的腾讯位置服务的key是否设置正确' });
      return;
    }

    toggleIsShowMap(true);
  };


  const onPositionChange = (val) => { // 根据选择地址，存储最新位置
    if (val.latitude === position.latitude) return;

    const newPosition = { ...val };
    newPosition.location === '我的位置' && (newPosition.location = newPosition.cityname);
    onChange(newPosition)
  }

  return (
    <div className={styles.position}>
      <Tag
        type="primary"
        closeable={position.location}
        onClick={openMap}
        onClose={() => onChange({})}
        className={classNames(styles.tag, {
          [styles.checked]: !!position.location,
        })}
      >
        <Icon name="PositionOutlined" size={12} />
        {position.location || '你在哪里？'}
      </Tag>
      {isShowMap ? (
        <MapDialog
          mapUrl={mapUrl}
          onClose={() => { toggleIsShowMap(!isShowMap); }}
          onChange={onPositionChange}
        />
      ) : ''}
    </div>
  );
};

Index.propTypes = {
  position: PropTypes.object,
  lbskey: PropTypes.string,
  onChange: PropTypes.func,
};

Index.defaultProps = {
  position: {},
  lbskey: '',
  onChange: () => { },
};

export default Index;
