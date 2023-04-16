import React from 'react';
import styles from './index.module.scss';

function RewardDisplay(props) {
  const { number } = props;

  const numberStr = isNaN(Number(number)) ?  number : Number(number).toFixed(2)

  return (
    <div className={styles.contianer}>
      <img className={styles.image} src="/dzq-img/coin.png" alt="悬赏图标" />
      <div className={styles.text}>
        获得<span className={styles.number}>&nbsp;{numberStr}&nbsp;</span>元悬赏金
      </div>
    </div>
  );
}

export default React.memo(RewardDisplay);
