import React, { useState, useEffect, useRef, useMemo } from 'react';
import { inject, observer } from 'mobx-react';
import { readRegisterList } from '@discuzqsdk/sdk/dist/api/plugin/read-register';
import Tabs from '@discuzqsdk/design/dist/components/tabs/index';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import UserItem from '../user-item';
import styles from './index.module.scss';
import Router from '@discuzqsdk/sdk/dist/router';
import typeofFn from '@common/utils/typeof';
import { readLikedUsers } from '@server';
import List from '../../list';
import { View, Text } from '@tarojs/components'

/**
 * 帖子点赞、打赏点击之后的弹出视图
 * @prop {string}  visible 视图是否显示
 * @prop {string}  onHidden 关闭视图的回调
 */

 const Index = ({ visible = false, onHidden = () => {}, tipData = {}, router, index, isCustom = false, activityId, exportFn }) => {

  const allPageNum = useRef(1);
  const likePageNum = useRef(1);
  const tipPageNum = useRef(1);

  const [all, setAll] = useState(null);
  const [likes, setLikes] = useState(null);
  const [tips, setTips] = useState(null);

  const [current, setCurrent] = useState(0);

  const TYPE_ALL = 0;
  const TYPE_LIKE = 1;
  const TYPE_REWARD = 2;
  const TYPE_PAID = 3;

  useEffect(() => {
    if (visible) {
      loadData({ type: current });
    } else {
      index.setHasOnScrollToLower(true);
    }
  }, [visible]);

  const fetchActApplyPeople = async (page = 1) => {
    const result = await readRegisterList({ params: { activityId, page } });
    const { code, data, msg } = result || {};
    if (code === 0) {
      const { pageData = [], totalPage, currentPage, totalCount } = data || {};
      const list = page > 1 ? [...(all?.pageData?.list || []), ...pageData] : pageData;
      setAll({
        pageData: {
          list,
          allCount: totalCount,
        },
        currentPage,
        totalPage,
      });
    } else {
      setRequestError(true);
      setErrorText(msg);
    }
    return result;
  };
   const loadData = async ({ type }) => {
    if (isCustom) {
      return fetchActApplyPeople();
    }
    const { postId = '', threadId = '' } = tipData;

    const res = await readLikedUsers({ params: { threadId, postId, type, page: 1 } });
    if(res?.code === 0) {
      setAll(res?.data);
    } else {
      setRequestError(true);
      setErrorText(res?.msg);
    }
    return res;
  };

   const singleLoadData = async ({ page = 1, type = 1 } = {}) => {
    if (isCustom) {
      return fetchActApplyPeople(page);
    }
    const { postId = '', threadId = '' } = tipData;
    type = (type === TYPE_PAID) ? TYPE_REWARD : type;
    const res = await readLikedUsers({ params: { threadId, postId, page, type } });
    const data = res?.data || {};

    if (type === TYPE_ALL) {
      if (page !== 1) {
        data?.pageData?.list.unshift(...(all?.pageData?.list || []));
      }
      setAll(data);
    } else if (type === TYPE_LIKE) {
      if (page !== 1) {
        data?.pageData?.list.unshift(...(likes?.pageData?.list || []));
      }
      setLikes(data);
    } else if (type === TYPE_REWARD || type === TYPE_PAID) {
      if (page !== 1) {
        data?.pageData?.list.unshift(...(tips?.pageData?.list || []));
      }
      setTips(data);
    }

    return res
  };

  const loadMoreData = () => {

    if (current === 0) {
      allPageNum.current += 1;
      return singleLoadData({ page: allPageNum.current, type: current });
    }
    if (current === 1) {
      likePageNum.current += 1;
      return singleLoadData({ page: likePageNum.current, type: current });
    }
    tipPageNum.current += 1;
    return singleLoadData({ page: tipPageNum.current, type: current });
  };

  const onClickTab = (id) => {
    setCurrent(id);
    const hasAll = id === 0 && !all;
    const hasLikes = id === 1 && !likes;
    const hasTips = (id === 2 || id === 3) && !tips;

    if (hasAll || hasLikes || hasTips) {
      singleLoadData({ type: id, page: 1 });
    }
  };

  const searchClick = () => {

  };

  const onUserClick = (userId = '') => {
    Router.push({url: `/userPages/user/index?id=${userId}`});
  };

  const onClose = () => {
    onHidden();
    setAll(null);
    setLikes(null);
    setTips(null);
    setCurrent(0);
  };

  const renderHeader = ({ title, icon, number }) => (
    <View className={styles.label}>
      {icon && <Icon className={styles.icon} name={icon} />}
      {title && <Text className={`${styles.title} disable-click`}>{title}</Text>}
      {number !== 0 && number !== '0' && <Text className={`disable-click ${styles.num}`}>{number}</Text>}
    </View>
  );

  let tabItems = [
    {
      icon: '',
      title: '全部',
      data: all,
      number: all?.pageData?.allCount || 0,
    },
    {
      icon: 'LikeOutlined',
      title: '',
      data: likes,
      number: all?.pageData?.likeCount || 0,
    },
    {
      icon: 'HeartOutlined',
      title: '付费',
      data: tips,
      number: (all?.pageData?.raidCount + all?.pageData?.rewardCount) || 0,
    },
    {
      icon: 'HeartOutlined',
      title: '打赏',
      data: tips,
      number: all?.pageData?.rewardCount || 0,
    },
  ];

  if (isCustom) tabItems = [tabItems[0]];

  const data = tabItems[0] || {};
  const oneData = data?.data?.pageData?.list[0] || {};
  const isHavaAdditionalInfo = isCustom
    && typeofFn.isObject(oneData?.additionalInfo)
    && Object.keys(oneData?.additionalInfo).length > 0;

  const renderTabPanel = platform => (
    tabItems.map((dataSource, index) => {
      const arr = dataSource?.data?.pageData?.list;
      if (dataSource.number === 0 || dataSource.number === '0') {
        return null; // 列表数量为0不显示该Tab
      }
      if (tipData?.payType > 0) {
        if (index === 3) return null; // 付费用户不需打赏列表
      } else {
        if (index === 2) return null; // 非付费用户不需显示付费列表
      }
      return (
        <Tabs.TabPanel
          key={index}
          id={index}
          label={renderHeader({ icon: dataSource.icon, title: dataSource.title, number: dataSource.number })}>
            {
              arr?.length ? (
                <List
                  className={styles.list}
                  wrapperClass={styles.listWrapper}
                  onRefresh={loadMoreData}
                  noMore={dataSource.data?.currentPage >= dataSource.data?.totalPage}
                  hasOnScrollToLower={true}
                >
                  {
                    arr.map((item, index) => (
                        <UserItem
                          key={index}
                          index={index}
                          imgSrc={item.avatar}
                          title={item.nickname || item.username}
                          subTitle={item.passedAt}
                          userId={item.userId}
                          additionalInfo={item.additionalInfo}
                          platform={platform}
                          onClick={onUserClick}
                          type={item.type}
                          className={styles.userItem}
                        />
                    ))
                  }
                </List>
              ) : <Spin className={styles.spinner} type="spinner" />

            }
        </Tabs.TabPanel>
      );
    }).filter(item => item !== null)
  );

  return (
    <Popup
        position='bottom'
        visible={visible}
        onClose={onClose}
        customScroll
    >
    {
      !all ?
          <Tabs
            activeId={current}
            className={styles.tabs}
          >
            <Tabs.TabPanel key={0} id={0}>
              <Spin className={styles.spinner} type="spinner" />
            </Tabs.TabPanel>
          </Tabs>
      :
        <Tabs
          onActive={onClickTab}
          activeId={current}
          className={styles.tabs}
          external={
            <>
            {isCustom && isHavaAdditionalInfo && <Button type="text" onClick={exportFn} className={styles.export}>导出</Button>}
            {tipData?.platform === 'pc' && (
              <View onClick={onClose} className={styles.tabIcon}>
                <Icon name="CloseOutlined" size={12} />
              </View>
            )}
          </>
          }
        >
          {
            renderTabPanel(tipData?.platform)
          }
        </Tabs>
    }


    </Popup>
  );
};

export default inject('index')(observer(Index));
