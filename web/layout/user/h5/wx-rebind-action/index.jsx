import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Toast, Icon } from '@discuzqsdk/design';
import JoinBanner from '@components/join-banner-pc';
import LoadingBox from '@components/loading-box';
import PcBodyWrap from '../components/pc-body-wrap';
import styles from './index.module.scss';

@inject('site')
@inject('user')
@observer
class WXRebindActionPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentStatus: '',
      errorTips: '换绑失败',
    };
  }
  async componentDidMount() {
    try {
      const { router, user } = this.props;
      const { code, sessionId, sessionToken, state } = router.query;
      await user.rebindWechatH5({
        code,
        sessionId,
        sessionToken,
        state
      });
      this.setState({
        currentStatus: 'success'
      });
    } catch (e) {
      this.setState({
        currentStatus: 'error',
        errorTips: e.Msg
      });
    }
  }

  render() {
    const { currentStatus, errorTips } = this.state;
    return (
      <PcBodyWrap>
        <div className={styles.container}>
          <JoinBanner />
          <div className={styles.content}>
              { currentStatus === 'success' && <Icon color='#3AC15F' name="SuccessOutlined" size={80} className={styles.statusIcon} /> }
              { currentStatus === 'error' && <Icon color='#E02433' name="WrongOutlined" size={80} className={styles.statusIcon} /> }
              <p className={styles.statusBottom}>{ currentStatus && (currentStatus === 'success' ? '扫码成功' : '换绑失败') }</p>
              { currentStatus === 'error' && <p className={styles.hint}>{errorTips}</p> }
              { !currentStatus && <LoadingBox style={{ minHeight: '100%' }} />}
          </div>
        </div>
      </PcBodyWrap>
    );
  }
}

export default withRouter(WXRebindActionPage);
