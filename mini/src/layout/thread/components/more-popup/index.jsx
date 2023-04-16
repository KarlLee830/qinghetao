import React, { useEffect, useState, useMemo } from 'react';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
// import Button from '@discuzqsdk/design/dist/components/button/index';

import className from 'classnames';
import { View ,Button} from '@tarojs/components';
import styles from './index.module.scss';

const InputPop = (props) => {
  const { visible, onSubmit, onClose, onOperClick, permissions = {}, statuses = {}, shareData, isShowShare } = props;
  const { canEdit, canDelete, canEssence, canStick, canShare, canCollect, isAdmini } = permissions;
  const { isEssence, isStick, isCollect } = statuses;

  const [essence, setEssence] = useState(isEssence);
  const [stick, setStick] = useState(isStick);
  const [collect, setCollect] = useState(isCollect);

  const buttonNumber = useMemo(
    () => (isShowShare ? 2 : 1 + canEdit + canDelete + canEssence + canStick + canShare + canCollect),
    [canEdit, canDelete, canEssence, canStick, canShare, canCollect, isShowShare],
  );

  useEffect(() => {
    setEssence(isEssence);
  }, [isEssence]);

  useEffect(() => {
    setStick(isStick);
  }, [isStick]);

  useEffect(() => {
    setCollect(isCollect);
  }, [isCollect]);

  return (
    <Popup position="bottom" visible={visible} onClose={onClose} customScroll={true}>
      <View className={styles.body}>
        <View className={styles.container}>
          <View className={className(styles.more, buttonNumber < 5 && styles.flex)}>
            {canEdit && !isShowShare && (
              <View className={styles.moreItem} onClick={() => onOperClick('edit')}>
                <View className={styles.icon}>
                  <Icon name="RedactOutlined" size={20}></Icon>
                </View>
                <View className={styles.text}>编辑</View>
              </View>
            )}
            {canDelete && !isShowShare && (
              <View className={styles.moreItem} onClick={() => onOperClick('delete')}>
                <View className={styles.icon}>
                  <Icon name="DeleteOutlined" size={20}></Icon>
                </View>
                <View className={styles.text}>删除</View>
              </View>
            )}
            {canEssence && !isShowShare && (
              <View
                className={className(styles.moreItem, essence && styles.actived)}
                onClick={() => onOperClick('essence')}
              >
                <View className={styles.icon}>
                  <Icon name="HotBigOutlined" size={20}></Icon>
                </View>
                <View className={styles.text}>精华</View>
              </View>
            )}
            {canStick && !isShowShare && (
              <View
                className={className(styles.moreItem, stick && styles.actived)}
                onClick={() => onOperClick('stick')}
              >
                <View className={styles.icon}>
                  <Icon name="TopOutlined" size={20}></Icon>
                </View>
                <View className={styles.text}>置顶</View>
              </View>
            )}
            {canCollect && !isShowShare && (
              <View
                className={className(styles.moreItem, collect && styles.actived)}
                onClick={() => onOperClick('collect')}
              >
                <View className={styles.icon}>
                  <Icon name="CollectFunOutlined" size={20}></Icon>
                </View>
                <View className={styles.text}>收藏</View>
              </View>
            )}
            {/* TODO:生成海报 */}
            {canShare && isShowShare && (
              <View className={styles.moreItem} onClick={() => onOperClick('posterShare')}>
                <View className={styles.icon}>
                  <Icon name="PictureOutlinedBig" size={20}></Icon>
                </View>
                <View className={styles.text}>生成海报</View>
              </View>
            )}
            {/* TODO:微信分享 */}
            {canShare && isShowShare && (
              <View className={styles.moreItem}>
                <Button
                  className={className(styles.icon)}
                  openType="share"
                  data-shareData={shareData}
                  onClick={() => onOperClick('wxShare')}
                >
                  <Icon className={styles.icon} size="20" name="WeChatOutlined"></Icon>
                </Button>
                <View className={styles.text}>微信分享</View>
              </View>
            )}
            {!isShowShare && !isAdmini && (
              <View className={styles.moreItem} onClick={() => onOperClick('report')}>
                <View className={styles.icon}>
                  <Icon name="WarnOutlined" size={20}></Icon>
                </View>
                <View className={styles.text}>举报</View>
              </View>
            )}
          </View>
        </View>

        <View className={styles.button}>
          <Button full={true} onClick={onSubmit} className={styles.cancel} type="default">
            取消
          </Button>
        </View>
      </View>
    </Popup>
  );
};

export default InputPop;
