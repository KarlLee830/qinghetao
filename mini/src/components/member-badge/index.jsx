import React from 'react';
import styles from './index.module.scss';
import classnames from 'classnames';
import { IMG_SRC_HOST } from '@common/constants/site';
import { View, Text, Image } from '@tarojs/components';

export default class MemberBadge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { className = '', groupLevel, groupName, hasBg, groupNameStyle, memberBadgeStyle, onClick = () => {} } = this.props;

    return (
      <View className={classnames(className, styles.memberBadgeBox, hasBg ? styles.bg : styles.default)} style={memberBadgeStyle}
        onClick={(e) => {
          e.stopPropagation();
          onClick({
            groupLevel,
            groupName,
          });
        }}
      >
        <Image className={styles.memberBadgeIcon} src={`${IMG_SRC_HOST}/dzq-img/member-badge_${groupLevel}.png`} />
        <View className={classnames(styles.memberBadgeName, styles['memberBadgeName_' + groupLevel])}>
          <Text className={styles.memberBadgeNameText} style={groupNameStyle}>
            {groupName}
          </Text>
        </View>
      </View>
    );
  }
}
