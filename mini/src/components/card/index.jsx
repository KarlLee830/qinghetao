import React, { useState, useEffect } from 'react'
import { View, Button } from '@tarojs/components'
import { Checkbox } from '@discuzqsdk/design';
import styles from './index.module.scss'
import Card from './card';
import { saveToAlbum } from './utils'
import getConfig from './config/thread-card';
import { throttle } from '@common/utils/throttle-debounce.js';
import { inject, observer } from 'mobx-react';
import getSiteConfig from './config/site-card';
import getCommentConfig from './config/comment-card/index.js'
import getExperienceConfig from './config/experience-card';
import ExperienceHeader from './config/experience-card/header.jsx';

const Index = ({
  thread,
  miniCode,
  site,
  user,
  data,
  comment,
  experienceData
}) => {
  const [hidePart, setHidePart] = useState(false);

  useEffect(() => {
    if(comment){
      getCommentConfig({ site, comment, miniCode, siteName, hidePart }).then(
        config => {
          setConfig(config);
        }
      )
    }else if(thread) {
      getConfig({ site, thread, miniCode, siteName, hidePart }).then(
        config => {
          setConfig(config);
        }
      )
    }else if (experienceData) {
      getExperienceConfig({ site, miniCode, experienceData }).then(
        config => {
          setConfig(config);
        }
      )
    } else {
      getSiteConfig({ data, miniCode, siteName, user }).then(
        config => {
          setConfig(config)
        }
      )
    }
  }, [miniCode, hidePart])
  const [config, setConfig] = useState('')
  const [shareImage, setShareImage] = useState('')
  const {siteName} = site.webConfig?.setSite || ''


  return (
    <View className={styles.container}>
      { experienceData && <ExperienceHeader/>}
      <Card hidePart = {hidePart} config={config} setShareImage={setShareImage} miniCode={miniCode} experience={!!experienceData}></Card>
      <View className={`${styles.shareBtn} ${( comment || thread ) && styles.hasHidePart}`}>
        {
          ( comment || thread )&& (
            <View className={styles.checkbox}>
            <Checkbox onChange={()=>setHidePart(!hidePart)} checked={hidePart}> 隐藏部分内容 </ Checkbox>
          </View>
          )
        }
        <Button className={styles.btn} onClick={throttle(saveToAlbum(shareImage), 500)}>保存到相册</Button>
      </View>
    </View>)
}
export default inject('index', 'site', 'user')(observer(Index));
