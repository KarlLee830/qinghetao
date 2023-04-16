import React, { forwardRef, useImperativeHandle } from 'react';
import { useState } from 'react';
import { inject, observer } from 'mobx-react';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Tabs from '@discuzqsdk/design/dist/components/tabs/index';
import { View } from '@tarojs/components'
import { randomStr } from '@components/thread/utils'
import { useRef } from 'react';
import styles from '../../index.module.scss';
import NavBar from '../nav-bar';
import { useEffect } from 'react';
import Taro from '@tarojs/taro';
import classNames from 'classnames';

const Index = forwardRef((props, ref) => {
    const [fixedTab, setFixedTab] = useState(false)
    const tabsId = useRef(`tabs-id-${randomStr()}`)
    const observerObj = useRef(null)

    useImperativeHandle(
      ref,
      () => ({
        changeFixedTab,
      }),
    );

    useEffect(() => {
        const { currentCategories = [] } = props.index || {};

        if (currentCategories?.length && !observerObj.current) {
            setTimeout(() => {
                observePage()
            }, 10);
        }
    }, [props.index?.currentCategories])

    const changeFixedTab = () => {
      if (fixedTab) {
        setFixedTab(false)
      }
    }

    const observePage = () => {
      if (observerObj.current) {
        observerObj.current.disconnect(); // 关闭观察器
      }

      observerObj.current = Taro.createIntersectionObserver().relativeToViewport({ top: 100 });
      observerObj.current.observe(`#${tabsId.current}`, (res) => {
          const isHidden = res.intersectionRatio <= 0
          setFixedTab(isHidden)
      });
    }

    const handleClickTab = (e) => {
      if (!fixedTab) {
        return
      }
      const { onClickTab } = props
      onClickTab(e)
    }

    const renderTabs = () => {
        const { index, onClickTab, searchClick } = props;

        const { categories = [], activeCategoryId, currentCategories } = index;

        return (
          <>
            {categories?.length > 0 && (
              <>
              <View
                id={tabsId.current}
                className={styles.homeContent}
              >
                <Tabs
                  className={styles.tabsBox}
                  scrollable
                  type="primary"
                  onActive={onClickTab}
                  activeId={activeCategoryId}
                  external={
                    <View onClick={searchClick} className={styles.tabIcon}>
                      <Icon name="SecondaryMenuOutlined" className={styles.buttonIcon} size={16} />
                    </View>
                  }
                >
                  {currentCategories?.map((item, index) => (
                    <Tabs.TabPanel key={index} id={item.pid} label={item.name} />
                  ))}
                </Tabs>
              </View>
              </>
            )}
          </>
        );
      };

      const renderFixedTabs = () => {
        const { index, site, searchClick } = props;
        const { categories = [], activeCategoryId, currentCategories } = index;

        return (
          <View className={classNames(styles.fixed, fixedTab ? styles.showUp : '')}>
            <NavBar title={site?.webConfig?.setSite?.siteName || ''} />
            {categories?.length > 0 && (
              <View
                className={`${styles.homeContent}`}
              >
                <Tabs
                  className={styles.tabsBox}
                  scrollable
                  type="primary"
                  onActive={handleClickTab}
                  activeId={activeCategoryId}
                  external={
                    <View onClick={searchClick} className={styles.tabIcon}>
                      <Icon name="SecondaryMenuOutlined" className={styles.buttonIcon} size={16} />
                    </View>
                  }
                >
                  {currentCategories?.map((item, index) => (
                    <Tabs.TabPanel key={index} id={item.pid} label={item.name} />
                  ))}
                </Tabs>
              </View>
            )}
          </View>
        );
      }

    return (
        <View>
            { renderTabs() }
            { renderFixedTabs() }
        </View>
    )
})

export default inject('site', 'index')(observer(Index))
