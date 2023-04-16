import React from 'react';
import Header from '@components/header';
import styles from '../index.module.scss';
import Qrcode from '../../../components/qrcode';

export default class QrcodePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  componentDidMount() {
  }

  render() {
    const { dzqRequest, _pluginInfo, siteData, dzqRequestHandleError } = this.props;

    return (
      <div className={styles['qrcode-page']}>
        <Header />
        <div className={styles['qrcode-content']}>
          <Qrcode dzqRequest={dzqRequest} _pluginInfo={_pluginInfo} siteData={siteData} dzqRequestHandleError={dzqRequestHandleError}/>
        </div>
      </div>
    );
  }
}
