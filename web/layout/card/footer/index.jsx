import React, { useEffect, useState } from 'react';
import { inject, observer } from 'mobx-react';
import { getMiniCode } from '@server';
import setUrlParam from '@utils/set-url-param';
import styles from './index.module.scss';
import QRCode from 'qrcode.react';

const Index = ({ site, setReady, threadId = '', commentId = '', inviteCode = '' }) => {
  const [miniCode, setMiniCode] = useState('');
  const [miniConfig, setMiniConfig] = useState(true);
  const defaultLogo = '/dzq-img/default-logo.png';
  const { siteName } = site.webConfig?.setSite || '';
  const href = window.location.href.split('/');
  // href[href.length - 1] = threadId ? `thread/${threadId}` : '';
  if (commentId) {
    href[href.length - 1] =  `thread/comment/${commentId}?threadId=${threadId}`;
  } else if (threadId) {
    href[href.length - 1] =  `thread/${threadId}`;
  } else {
    href[href.length - 1] =  '';
  }

  useEffect(async () => {
    try {
      // const threadPath = `/indexPages/thread/index?id=${threadId}`;
      // const commentPath = '';
      // const sitePath = '/indexPages/index/index';
      let path = '';
      if (commentId) {
        path = `/indexPages/thread/comment/index?id=${commentId}&threadId=${threadId}&fromMessage=true`;
      } else if (threadId) {
        path = `/indexPages/thread/index?id=${threadId}`;
      } else {
        path = '/indexPages/index/index';
      }
      const paramPath = `/pages/index/index?path=${encodeURIComponent(setUrlParam(path, { inviteCode }) || '')}`;
      const res = await getMiniCode({ params: { path: paramPath } });
      if (res?.code === 0) {
        setMiniCode(res?.data.base64Img);
      } else if (res?.code === -7081) {
        setMiniConfig(false);
      } else {
        setMiniCode(defaultLogo);
      }
    } catch {
      setMiniCode(defaultLogo);
    }
    setReady(true);
  }, []);
  const pathName = href.join('/');
  return (
        <div className={styles.footerBox}>
            {!miniConfig
              ? <QRCode value={setUrlParam(pathName, { inviteCode }) || ''} size={96}></QRCode>
              : <img alt="图片" src={miniCode} className={styles.footerImg}/>}
            <span className={styles.desc}>
                {`长按识别${miniConfig ? '小程序' : '二维码'}查看详情`}
            </span>
            <span className={styles.siteName}>
                {`来自${siteName}`}
            </span>
        </div>
  );
};

export default inject('site')(observer(Index));
