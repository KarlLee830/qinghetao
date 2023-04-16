import React from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';

@inject('user')
@observer
class UserCenterHeaderImage extends React.Component {
  render() {
    const { query } = this.props.router;

    let backgroundUrl = this.props.user?.backgroundUrl;

    if (query.id) {
      backgroundUrl = this.props.user.targetUsers[query.id]?.backgroundUrl;
    }

    return (
      <div
        className={styles.box}
        style={{
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'url(\'/dzq-img/my-default-header-img.jpg\')',
        }}
        {...this.props}
      />
    );
  }
}

export default withRouter(UserCenterHeaderImage);
