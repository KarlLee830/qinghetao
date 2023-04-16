import React from 'react';
import styles from './index.module.scss';
import classnames from 'classnames';

export default class MemberBadge extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { className = '', groupLevel, groupName, hasBg, groupNameStyle, memberBadgeStyle, onClick = () => {} } = this.props;
    return (
      <div className={classnames(className, styles.memberBadgeBox, hasBg ? styles.bg : styles.default)}
        style={memberBadgeStyle}
        onClick={(e) => {
          e.stopPropagation();
          onClick({
            groupLevel,
            groupName,
          });
        }}
      >
        <img className={styles.memberBadgeIcon} src={`/dzq-img/member-badge_${groupLevel}.png`} />
        <div className={classnames(styles.memberBadgeName, styles['memberBadgeName_' + groupLevel])}>
          <span className={styles.memberBadgeNameText} style={groupNameStyle}>
            {groupName}
          </span>
        </div>
      </div>
    );
  }
}
