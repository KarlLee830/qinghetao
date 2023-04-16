import React from 'react';
import { inject } from 'mobx-react';
import Dialog from '@components/dialog';
import { Popup, Icon } from '@discuzqsdk/design';
import ReactDOM from 'react-dom';
import styles from './index.module.scss';

@inject('site')
export default class FilePreview extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      errMsg: ''
    };
  }

  getAuthorization() {
    try {
      const { url } = this.props.file;
      const urlObj = new URL(url);

      const params = urlObj.search.split('?')[1].split('&').map(item => item.split('=')).reduce((res, cur) => {
        res[cur[0]] = cur[1];
        return res;
      }, {});

      return decodeURIComponent(params.sign);
    } catch (err) {
      return undefined;
    }
  }

  async componentDidMount() {
    try {
      const {file} = this.props;
      if (!file?.url) {
        this.setState({ errMsg: '预览失败：文件地址为空' });
        return;
      }

      const urlObj = new URL(file.url);
      const objectUrl = `${urlObj.origin}${urlObj.pathname}`;
      const authorization = this.getAuthorization();

      const url = await COSDocPreviewSDK.getPreviewUrl({
        objectUrl,
        credentials: {
          authorization,
          secretId: '',
          secretKey: ''
        }
      });

      if (!url) {
        this.setState({ errMsg: '预览失败：文件存储异常。请下载到本地查看' });
        return;
      }

      const mount = document.querySelector('#preview');
      const preview = COSDocPreviewSDK.config({
        mode: 'simple',
        mount,
        url,
      });
    } catch(err) {
      this.setState({ errMsg: '预览失败，请下载到本地查看' });
    }
  }

  renderPC() {
    const { file, onClose } = this.props;

    return (
      <Dialog title={file.fileName} onClose={onClose} pc visible isCustomBtn className={styles.dialog}>
      {
        this.state.errMsg ? <div className={styles.errMsg}>{ this.state.errMsg }</div> : <div id="preview"></div>
      }
      </Dialog>
    );
  }
    
  renderH5() {
    const { file, onClose } = this.props;

    return (
      <Popup
        className={styles.popup}
        position="center"
        visible
      >
        <div className={styles.header}>
          {file.fileName}
          <Icon
            className={styles['header-close']}
            name="LeftOutlined"
            size={18}
            onClick={onClose}
          />
        </div>
        {
          this.state.errMsg ? <div className={styles.errMsg}>{ this.state.errMsg }</div> : <div id="preview"></div>
        }
      </Popup>
    );
  }
    
  render() {
    const { site: { isPC } } = this.props;

    return ReactDOM.createPortal(
      isPC ? this.renderPC() : this.renderH5(),
      document.getElementsByTagName('body')[0],
    );
  }
}
