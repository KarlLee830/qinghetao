import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import Avatar from '@components/avatar';
import { readWechatPosterGenqrcode } from '@server';
import QRCode from 'qrcode.react';

const ExperienceCard = inject('user', 'card', 'site')(observer(({user, setReady, card, site }) => {
  const [miniCode, setMiniCode] = useState('');
  const [miniConfig, setMiniConfig] = useState(true);
  const [miniCodeCofig, setMiniCodeCofig] = useState(null);
  const defaultLogo = '/dzq-img/default-logo.png';
  const href = window.location.href.split('/');
  href[href.length - 1] =  '';
  useEffect(async () => {
    try {
      const path = '/indexPages/index/index';
      const paramPath = `/pages/index/index?path=${encodeURIComponent(path || '')}`;
      const res = await readWechatPosterGenqrcode({ params: { redirectUri: (site?.wechatEnv === 'miniProgram' ? paramPath : window.location.origin) } });
      if (res?.code === 0) {
        setMiniCode(res?.data.base64Img);
        setMiniCodeCofig(res?.data);
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

  card.setImgReady();
  const pathName = href.join('/');
  return (
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.title}>{site?.siteName || ''}</div>
          <div className={styles.tips}>免费体验卡</div>
          <div className={styles.avatar}>
            <Avatar
              circle={true}
              wrapClassName={styles.avatarWrap}
              image={user.avatarUrl}
              size='big'
              name={user.nickname}
            />
          </div>
          <div className={styles.nickname}>{user.nickname || ''}</div>
          <div className={styles.invite}>邀你领取 {site?.siteName || ''}</div>
          <div className={styles.card__time}>{miniCodeCofig?.timeRange || ''}天免费体验卡</div>
          <div className={styles.expiration__time}>{miniCodeCofig?.endTime || ''}此{!miniConfig || site?.wechatEnv === 'openPlatform' ? '二维码' : '小程序码'}失效</div>
          <div className={styles.footer}>
            <div className={styles.miniCodeWrap}>
              <div className={styles.miniCode}>
                {
                  !miniConfig
                    ? <QRCode value={pathName} size={96}></QRCode>
                    : <img alt="图片" src={miniCode} className={styles.footerImg}/>
                }
              </div>
              <div className={styles.miniCodeTips}>长按识别{!miniConfig || site?.wechatEnv === 'openPlatform' ? '二维码' : '小程序码'}</div>
            </div>
            <div className={styles.notch}></div>
            <div className={styles.notch}></div>
          </div>
        </div>
      </div>
  );
}));

export default ExperienceCard;
