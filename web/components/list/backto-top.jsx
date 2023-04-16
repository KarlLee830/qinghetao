import React from 'react';
import styles from './index.module.scss';

export default function BacktoTop(props) {
  const { className = '', onClick = () => { }, h5, showTabBar = false } = props;
  let cls = h5 ? styles.h5 : styles.pc;
  if (showTabBar && h5) cls = `${cls} ${styles.tabbar}`;
  return (
    <div className={`${styles.backtotop} ${cls} ${className}`} onClick={onClick}>
      {/* <img src="/dzq-img/backtop.svg" alt="backtotop icon" className={styles.topIcon} /> */}
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
        <g id="backtotop" data-name="置顶 (8)" transform="translate(0.037 -6.4)">
          <path id="路径_348" data-name="路径 348" d="M19.129,6.4a.859.859,0,0,1,.049,1.715H.8A.859.859,0,0,1,.748,6.4H19.129Z" transform="translate(0)" fill="#8590a6"/>
          <path id="路径_349" data-name="路径 349" d="M97.154,134.607a.84.84,0,0,1,1.13.036l7.169,7.017.037.039a.8.8,0,0,1-.037,1.106l-.04.036a.84.84,0,0,1-1.13-.036l-5.757-5.635v13.612a.828.828,0,0,1-1.653-.048V137.171l-5.757,5.635-.04.036a.84.84,0,0,1-1.147-.058.8.8,0,0,1,.017-1.124l7.169-7.017Z" transform="translate(-87.736 -125.146)" fill="#8590a6"/>
        </g>
      </svg>
    </div>
  );
}
