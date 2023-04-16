/* eslint-disable spaced-comment */

/**
 * 发帖页底部分类、图片等工具栏
 */
import React, { useState, useMemo, memo, useCallback, useEffect } from 'react';
import { observer, inject } from 'mobx-react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import { attachIcon } from '@common/constants/const';
import { Units } from '@components/common';
import { THREAD_TYPE } from '@common/constants/thread-post';
import DZQPluginCenterInjection from '@discuzqsdk/plugin-center/dist/components/DZQPluginCenterInjection';

// 插件引入
/**DZQ->plugin->register<plugin_post@post_extension_entry_hook>**/

const Index = inject(
  'site',
  'user',
  'plugin',
  'threadPost',
)(
  observer((props) => {
    const { threadPost, clickCb, onCategoryClick, onSetplugShow, user, operationType, site } = props;
    const {
      webConfig: {
        other: { threadOptimize },
      },
    } = site;

    // 控制插件icon的显示/隐藏
    const [plugShow, setplugShow] = useState(false);
    // 设置当前选中的插件
    const [currentplug, setCurrentplug] = useState({});

    const [canInsertplugsin, setCanInsertplugsin] = useState({});

    const content = useCallback(() => {
      const { parent, child } = threadPost.categorySelected;
      return `${parent.name || ''}${child.name ? ` \\ ${child.name}` : ''}`;
    }, [threadPost.categorySelected]);

    const getIconCls = (item) => {
      const cls = styles['plug-icon'];
      if (!item) return cls;
      const activeCls = `${styles['plug-icon']} ${styles.active}`;
      if (item.type === operationType && item.type !== THREAD_TYPE.anonymity) return activeCls;
      const { postData } = threadPost;
      if (item.type === THREAD_TYPE.reward && postData?.rewardQa?.value) return activeCls;
      if (item.type === THREAD_TYPE.goods && postData?.product?.id) return activeCls;
      if (item.type === THREAD_TYPE.voice && postData?.audio?.mediaUrl) return activeCls;
      if (item.type === THREAD_TYPE.video && postData?.video?.thumbUrl) return activeCls;
      if (item.type === THREAD_TYPE.image && Object.keys(postData?.images || []).length > 0) return activeCls;
      if (item.type === THREAD_TYPE.vote && postData?.vote?.voteTitle) return activeCls;
      if (item.type === THREAD_TYPE.anonymity && postData?.anonymous) return activeCls;
      const plugin = (postData?.plugin && postData?.plugin[item.type]) || {};
      if (plugin?.tomId) return activeCls;
      return cls;
    };

    // 插件icon元素
    const { threadExtendPermissions: tep } = user;
    const plug = useMemo(() => {
      // 筛选出有权限的插件
      const canInsert = attachIcon.filter((item) => {
        let canInsert = tep[item.type];
        if (item.type === THREAD_TYPE.video || item.type === THREAD_TYPE.voice) {
          canInsert = tep[item.type] && props?.isOpenQcloudVod;
        }

        if (
          item.type === THREAD_TYPE.reward ||
          item.type === THREAD_TYPE.anonymity ||
          item.type === THREAD_TYPE.goods
        ) {
          canInsert = tep[item.type] && threadOptimize;
        }

        return canInsert;
      });
      setCanInsertplugsin(canInsert);

      // 根据筛选后的插件渲染图标
      const plugs = canInsert.map((item, index) => (
        <Icon
          key={index}
          className={getIconCls(item)}
          onClick={() => {
            setplugShow(false);
            clickCb(item);
          }}
          name={item.name}
          // color={((item.type === operationType && item.type !== THREAD_TYPE.anonymity)
          //   || (threadPost.postData.anonymous && item.type === THREAD_TYPE.anonymity)) && item.active}
          size="20"
        />
      ));
      const styl = plugShow ? { display: 'flex' } : { display: 'none' };
      return (
        <View className={styles['plugin-icon-container']} style={styl}>
          <View className={styles['plugin-icon']}>
            {plugs}
            <DZQPluginCenterInjection
              className={pluginInfo => getIconCls({ type: pluginInfo?.pluginName })}
              target="plugin_post"
              hookName="post_extension_entry_hook"
              pluginProps={{
                onConfirm: props.threadPost.setPluginPostData,
                renderData: props.threadPost.postData.plugin,
                showPluginDialog: props.showPluginDialog,
                closePluginDialog: props.closePluginDialog,
                postData: {
                  navInfo: threadPost.navInfo,
                },
              }}
            />
          </View>

          <View
            className={styles.switcher}
            onClick={() => {
              setplugShow(false);
              onSetplugShow();
            }}
          >
            <Icon className={styles['icon-color']} name="MoreBOutlined" size="20" />
          </View>
        </View>
      );
    }, [tep, currentplug, operationType, threadPost.postData, plugShow]);

    useEffect(() => {
      if (!operationType) {
        setCurrentplug({});
      }
      attachIcon.forEach((item) => {
        if (item.type === operationType) {
          setCurrentplug(item);
        }
      });
    }, [operationType]);

    // 分类元素
    const category = (
      <View className={styles.category} onClick={onCategoryClick}>
        <Icon name="MenuOutlined" size="14" className={styles.icon} />
        <Text className={styles.text}>分类</Text>
        <Units
          type="tag"
          style={{ margin: '0', maxWidth: '200px' }}
          tagContent={content() || '选择分类(必选)'}
          onTagClick={() => {}}
        />
      </View>
    );

    return (
      <View className={`${styles.container} ${plugShow ? styles['container-plugin-show'] : ''}`}>
        <View className={styles.category}>
          {plugShow ? null : category}
          {plug}
        </View>
        <View
          onClick={() => {
            setplugShow(!plugShow);
            onSetplugShow();
          }}
        >
          {!plugShow && (
            <Icon className={styles['icon-color']} name={currentplug.name || canInsertplugsin[0]?.name} size="20" />
          )}
          <Icon className={styles['icon-color']} name="MoreBOutlined" size="20" />
        </View>
      </View>
    );
  }),
);

export default memo(Index);
