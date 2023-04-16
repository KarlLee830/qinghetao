import React from 'react';
import styles from './index.module.scss';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import classNames from 'classnames';
import { Popup } from '@discuzqsdk/design';
import isWeiXin from '@common/utils/is-weixin';

const index = ({ onClose, handleWxShare, handleH5Share, site, user, handleExperience, show, createCard, fromThread }) => (
      <Popup
        position="bottom"
        visible={show}
        onClose={onClose}
      >
        <div className={styles.body}>
          <div className={styles.container}>
            <div className={classNames(styles.more, styles.oneRow)}>
                <div className={styles.moreItem} onClick={createCard}>
                    <div className={styles.icon}>
                        <Icon name='PictureOutlinedBig' size={20}>
                        </Icon>
                    </div>
                    <span className={styles.text}>
                        生成海报
                    </span>
                </div>
                <div className={styles.moreItem} onClick={handleH5Share}>
                    <div className={styles.icon}>
                        <Icon name='PaperClipOutlined' size={20}>
                        </Icon>
                    </div>
                    <span className={styles.text}>
                        复制链接
                    </span>
                </div>
                {isWeiXin() && !fromThread && (
                <div className={styles.moreItem} onClick={handleWxShare}>
                    <div className={styles.icon}>
                        <Icon name='WeChatOutlined' size={20}>
                        </Icon>
                    </div>
                    <span className={styles.text}>
                        微信分享
                    </span>
                </div>
                )}
                { site?.wechatEnv !== 'none' && user?.isAdmini && (
                <div className={styles.moreItem} onClick={handleExperience}>
                    <div className={`${styles.icon} ${styles.experienceIcon}`}>
                        <Icon name='ExperienceOutlined' size={20}>
                        </Icon>
                    </div>
                    <span className={styles.text}>
                        限时体验卡
                    </span>
                </div>
                )}
            </div>
          </div>
            <div className={styles.button} >
                    <span className={styles.cancel} onClick={onClose}>
                        取消
                    </span>
            </div>
        </div>
      </Popup>
);

export default React.memo(index);
