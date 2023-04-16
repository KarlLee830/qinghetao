import React from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import { View, Text } from '@tarojs/components';
import { getCurrentInstance } from '@tarojs/taro';

@inject('user')
@observer
class UserCenterHeaderImage extends React.Component {
  constructor(props) {
    super(props);
    this.targetUserId = getCurrentInstance().router.params?.id;
  }
  
  render() {
    const userImageStyle = {}
    let backgroundUrl = this.props.user?.backgroundUrl;
    
    if (this.props.isOtherPerson) {
      backgroundUrl = this.props.user.targetUsers[this.targetUserId]?.backgroundUrl;
    }

    if (backgroundUrl) {
      Object.assign(userImageStyle, {
        backgroundImage: `url(${backgroundUrl})`
      })
    }

    return (
      <View
        className={styles.box}
        style={userImageStyle}
        {...this.props}
      />
    );
  }
}

export default UserCenterHeaderImage;
