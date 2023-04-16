/**
 * 分类弹框
 * @prop {boolean} show 输入弹框是否显示
 * @prop {array} category 输入分类列表
 * @prop {function} onHide 监听弹框切换显示隐藏
 */
import React, { useState, useEffect } from 'react';
import { inject, observer } from 'mobx-react';
import { View } from '@tarojs/components';
import Popup from '@discuzqsdk/design/dist/components/popup/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import styles from './index.module.scss';

import PropTypes from 'prop-types';
import typeofFn from '@common/utils/typeof';

const ClassifyPopup = (props) => {
  // props
  const { threadPost, show, category, onHide } = props;
  const { setPostData, categorySelected, setCategorySelected } = threadPost;
  // state
  const [parent, setParent] = useState({}); // 父类
  const [child, setChild] = useState({}); // 子类
  const [subCategory, setSubCategory] = useState([]); // 子类列表

  const handleParentClick = (item) => { // 父类点击
    if (item.categoryId === parent.categoryId) return;
    setParent(item);
    setChild({});
    if (item?.children?.length > 0) {
      setChildrenList(item?.children?.slice(), item);
      return;
    }
    setSubCategory([]);
    setPostData({ categoryId: item.categoryId });
    setCategorySelected({ parent: item, child: {} });
    onHide();
  };

  const handleChildClick = (item) => { // 子类点击
    setChild(item);
    setPostData({ categoryId: item.categoryId });
    setCategorySelected({ parent, child: item });
    onHide();
  };

  const setChildrenList = (list, item) => { // 设置子类列表
    if (typeofFn.isArray(list) && list.length > 0) {
      setSubCategory(list);
      setChild(list[0]);
      setPostData({ categoryId: list[0].categoryId });
      setCategorySelected({ parent: item, child: list[0] });
    } else {
      setSubCategory([]);
      setChild({});
    }
  };

  // hook
  useEffect(() => { // 回显分类,默认选中首项父类以及子类
    const { parent: storeParent, child: storeChild } = categorySelected;
    if (storeParent.categoryId && storeParent.categoryId !== parent.categoryId) {
      setParent(storeParent);
      setPostData({ categoryId: storeParent.categoryId });
    }
    if (storeChild.categoryId && storeChild.categoryId !== child.categoryId) {
      setChild(storeChild);
      setSubCategory(storeParent.children);
      setPostData({ categoryId: storeChild.categoryId });
    }
  }, [categorySelected]);

  return (
    <Popup
      className={styles.wrapper}
      position="bottom"
      visible={show}
      onClose={onHide}
    >
      <View className={styles.title}>选择分类</View>
      {/* 父类 */}
      <View className={`${styles.content} ${styles['content-parent']}`}>
        {(category?.slice() || []).map(item => (
          <Button
            key={item.categoryId}
            className={`${parent.categoryId === item.categoryId ? styles.active : ''}`}
            onClick={() => { handleParentClick(item) }}
          >
            {item.name}
          </Button>
        ))}
      </View>
      {/* 子类 */}
      {subCategory.length > 0 && (
        <View className={`${styles.content} ${styles['content-child']}`}>
          {(subCategory || []).map(item => (
            <Button
              key={item.categoryId}
              className={`${child.categoryId === item.categoryId ? styles.active : ''}`}
              onClick={() => { handleChildClick(item) }}
            >
              {item.name}
            </Button>
          ))}
        </View>
      )}
      {/* 取消按钮 */}
      <View className={styles.btn} onClick={onHide}>取消</View>
    </Popup>
  );
};

ClassifyPopup.propTypes = {
  show: PropTypes.bool.isRequired,
  category: PropTypes.array.isRequired,
  onHide: PropTypes.func.isRequired,
};

// 设置props默认类型
ClassifyPopup.defaultProps = {
  show: false,
  category: [],
  onHide: () => { },
};

export default inject('threadPost')(observer(ClassifyPopup));

