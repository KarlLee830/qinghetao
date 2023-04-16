import React from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import classnames from 'classnames';

@inject('site')
@observer
class CopyRight extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { site, center, line, className, mode, marginTop, marginBottom } = this.props;
    if (!site?.webConfig?.setSite) {
      return null;
    }

    const { platform, webConfig } = site;
    const { setSite } = webConfig;
    const isH5 = platform === 'h5';

    const clsName = classnames(styles.container, {
      [className]: !!className,
      copyright: true,
      [styles.center]: center || isH5,
      [styles.h5]: isH5,
      [styles.pc]: !isH5,
      [styles[`mode_${mode}`]]: !!mode
    })

    const style = {};
    marginTop !== undefined && (style.marginTop = `${marginTop}${isNaN(marginTop) ? '' : 'px'}`);
    marginBottom !== undefined && (style.marginBottom = `${marginBottom}${isNaN(marginBottom) ? '' : 'px'}`);

    const curYear = new Date().getFullYear();

    return (
      <div className={clsName} style={style}>
        <div className={styles.text}>
          <a href='/' target="_blank">
            &copy; {curYear} {setSite.siteName}
          </a>
        </div>
        <div className={styles.text}>
          <a href="https://discuzq.cc" title="Discuz! Q">{`Powered By Discuz! Q (${setSite.version})`}</a>
        </div>
        {
          setSite.siteRecord && (
            <div className={styles.text}>
              <a href="https://beian.miit.gov.cn/" rel='nofollow noopener noreferrer' target="_blank">
                {setSite.siteRecord}
              </a>
            </div>
          )
        }
        {
          setSite.siteRecordCode && (
            <div className={`${styles.text} ${styles.beian}`}>
              <a href='http://www.beian.gov.cn/portal/registerSystemInfo' target="_blank" rel='nofollow noopener noreferrer'>
                <img src="/dzq-img/beian.png" alt="公安备案号" />
                {setSite.siteRecordCode}
              </a>
            </div>
          )
        }
      </div>
    );
  }
}

export default CopyRight;
