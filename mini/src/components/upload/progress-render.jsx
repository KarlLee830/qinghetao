import React, { useEffect, useState } from 'react';
import styles from './progress.module.scss';
import { View, Text } from '@tarojs/components';

export default function ProgressRender(props) {
  const { file } = props;

  const [percent, setPercent] = useState(file.percent || 0);

  useEffect(() => {
    setTimeout(()=>{
      setPercent(file.percent);
    },0)
  }, [file.percent]);

  return (
    <View className={styles.container}>
      <Text>{percent}%</Text>
    </View>
  );
}
