import React, { useEffect, useState } from 'react';
import styles from './progress.module.scss';

export default function ProgressRender(props) {
  const { file } = props;

  const [percent, setPercent] = useState(file.percent || 0);

  useEffect(() => {
    setTimeout(() => {
      setPercent(file.percent);
    }, 0);
  }, [file.percent]);

  return (
    <div className={styles.container}>
      <span>{percent}%</span>
    </div>
  );
}
