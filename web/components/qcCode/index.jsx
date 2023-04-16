import React from 'react';
import style from './index.module.scss';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';

@inject('site')
@observer
class Index extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      siteName: ''
    };
  }

  qrCode = React.createRef(null)

  componentDidMount() {
    if (this.qrCode.current) {
      const url = this.props.site?.webConfig?.setSite?.siteUrl
      const QRCode = require('qrcodejs2')
      new QRCode(this.qrCode.current, {
        text: url,
        width: 83,
        height: 83,
      })
    }

    const title = this.props.site?.webConfig?.setSite?.siteName
    this.setState({
      siteName: title || 'Discuz! Q'
    })
  }

  render() {
    const { subTitle = '扫一扫访问移动端' } = this.props
    const { siteName } = this.state

    return (
      <div className={classNames(style.code, 'qrcode')}>
        <div className={style.codeBox} ref={this.qrCode}></div>
        <div className={style.codeText}>
          <p className={style.codeTextVisit}>{subTitle}</p>
          <p className={style.codeTextLogo}>{ siteName }</p>
        </div>
      </div>
    )
  }
}
export default Index