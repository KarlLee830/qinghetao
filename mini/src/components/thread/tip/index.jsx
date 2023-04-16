import React, { useState, useMemo } from 'react';
import PopupList from '../popup-list';
import Avatar from '../../avatar';
import { View, Text, Image } from '@tarojs/components';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import { debounce } from '@common/utils/throttle-debounce.js';
import { noop } from '../utils';

/**
 * 帖子点赞、打赏视图
 * @prop {string}    imgs 头像数据数组
 */

 const Index = inject('index')(
  observer(({ imgs = [], tipData = {}, wholeNum = 1,showMore=false, index, showCount = 5, unifyOnClick = null, updateViewCount = noop }) => {
  const [visible, setVisible] = useState(false);

  const onClick = debounce((e) => {
    e.stopPropagation();
    updateViewCount();
    index.setHiddenTabBar(true)
    index.setHasOnScrollToLower(false)
    setVisible(true);
  }, 200);

    const onHidden = () => {
      index.setHiddenTabBar(false);
      index.setHasOnScrollToLower(true);

      setVisible(false);
    };

    const renderUsers = useMemo(() => {
      const map = {};
      return imgs.reduce((result, item) => {
        if (!map[item.userId]) {
          result.push(item);
          map[item.userId] = 1;
        }
        return result;
      }, []);
    }, [imgs]);

    // 点赞头像的总宽度
    const sty = useMemo(() => {
      const imgsLength = renderUsers.length;
      return { width: `${(16 * imgsLength + 4 * (imgsLength + 1)) * 2}rpx` };
    }, [renderUsers]);

    const imgAfterArr = [styles.img, styles.imgAfter2, styles.imgAfter3, styles.imgAfter4, styles.imgAfter5];

    return (
      <>
        <View className={styles.container} onClick={unifyOnClick || onClick} style={sty}>
          {wholeNum !== 0 &&
            renderUsers
              ?.filter((_, index) => index < showCount)
              .map((item, index) => (
                <View key={index} className={imgAfterArr[index]}>
                  <Avatar image={item.avatar} name={item.nickname} size="small" />

                  {showMore && renderUsers?.length > showCount && index === 4 && (
                    <View className={styles.moreIcon} size={20}>
                      <Icon name="MoreBOutlined" className={styles.icon} size={12}></Icon>
                    </View>
                  )}
                </View>
              ))}
        </View>

        {visible && <PopupList tipData={tipData} visible={visible} onHidden={onHidden} />}
      </>
    );
  }),
);

export default React.memo(Index);
