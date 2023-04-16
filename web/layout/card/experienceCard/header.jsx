import React from 'react';
import styles from './header.module.scss';

const ExperienceCardHeader = () => (
  <div className={styles.container}>
      <div className={styles.rule}>
        <div className={styles.dot}>
          <span></span>
        </div>
        <div className={styles.text}>通过限时体验卡加入的用户，将被授权付费站点的查看权限，仅能查看站点仅30天内发布的内容。</div>
      </div>
      <div className={styles.rule}>
        <div className={styles.dot}>
          <span></span>
        </div>
        <div className={styles.text}>一个用户仅可使用体验卡一次，到期后需要付费加入。</div>
      </div>
  </div>
);

export default ExperienceCardHeader;
