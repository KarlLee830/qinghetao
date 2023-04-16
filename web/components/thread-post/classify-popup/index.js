/**
 * 分类弹出层
 */
import React, { useState, useEffect } from 'react'; // 性能优化的
import { Popup, Button, Icon } from '@discuzqsdk/design'; // 原来就有的封装
import styles from './index.module.scss'; // 私有样式
import PropTypes from 'prop-types'; // 类型拦截
import typeofFn from '@common/utils/typeof';
import classNames from 'classnames';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';

const ClassifyPopup = (props) => {
  const { pc, show, onVisibleChange, onClick = () => {}, categoryId } = props;
  const [categoryChildren, setCategoryChildren] = useState([]);
  const [selected, setSelected] = useState({});
  const [selectedChild, setSelectedChild] = useState({});

  const handleClose = () => {
    onVisibleChange(false);
  };
  const handleClick = (item) => {
    setSelected(item);
    setChildren(item);
    if (item.children && !item.children.length) handleClose();
  };
  const handleChildClick = (item) => {
    if (item.categoryId !== selectedChild.categoryId) {
      setSelectedChild(item);
      props?.threadPost.setPostData({ categoryId: item.categoryId || selected.categoryId });
    }
    handleClose();
  };

  const setChildren = (item, child = {}) => {
    let categoryId = child.categoryId || item.categoryId;
    if (item.children && typeofFn.isArray(item.children.slice()) && item.children.length > 0) {
      setCategoryChildren(item.children);
      if (child.categoryId) setSelectedChild(child);
      if (!(child.categoryId || selectedChild?.categoryId)) {
        setSelectedChild(item.children[0]);
        categoryId = item.children[0]?.categoryId;
      }
    } else {
      setCategoryChildren([]);
      setSelectedChild({});
    }
    if (!categoryId) return;
    props?.threadPost.setPostData({ categoryId });
  };

  const setSeletedCategory = () => {
    const id = props?.threadPost?.postData?.categoryId || '';
    const categorySelected = props?.threadPost?.getCategorySelectById(id);
    const { parent, child } = categorySelected;
    if (!parent?.categoryId) return;
    props?.threadPost?.setCategorySelected(categorySelected);
    setSelected(parent);
    setChildren(parent, child);
  };

  useEffect(() => {
    const { threadPost } = props;
    const { query } = props.router;
    // const categories = props.threadPost?.getCurrentCategories();
    // 编辑帖子需要根据id获取对应的帖子信息
    (async function () {
      await threadPost.readPostCategory(query.id);
      setSeletedCategory();
    }());
  }, [props.threadPost.categories.length, props.router.query.id]);

  useEffect(() => {
    setSeletedCategory(categoryId);
  }, [categoryId]);

  // useEffect(() => {
  //   setChildren(selected);
  // }, [selected]);

  const clsWrapper = pc ? classNames(styles.pc, styles.wrapper) : styles.wrapper;

  const category = props.threadPost?.getCurrentCategories();

  const content = (
    <div className={clsWrapper} onClick={onClick}>
      <div className={styles['popup-title']}>
        {pc && <Icon name="MenuOutlined" size="16" />}
        选择分类
      </div>
      <div className={styles['popup-content']} key={1}>
        {(category || []).map(item => (
          <Button
            key={item.categoryId}
            className={classNames({
              active:
                selected.categoryId === item.categoryId,
              'is-pc': pc,
            })}
            onClick={() => {
              handleClick(item);
            }}
          >
            {item.name}
          </Button>
        ))}
      </div>
      {categoryChildren.length > 0 && (
        <div className={classNames(styles['popup-content'], styles['popup-content__children'])}>
          {(categoryChildren || []).map(item => (
            <Button
              key={item.categoryId}
              className={classNames({
                active: selectedChild.categoryId === item.categoryId,
                'is-pc': pc,
              })}
              onClick={() => {
                handleChildClick(item);
              }}
            >
              {item.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  if (pc) return content;

  return (
    <Popup
      className={styles.tan}
      position="bottom" // 从哪个地方弹出 'bottom' | 'top' | 'center';
      maskClosable={true} // 点击遮罩层是否关闭弹出层，但好像没什么用
      visible={show} // 是否显示弹出层
      onClose={() => {
        // 遮罩层点击关闭回调,传一个'取消'，可自定义更改
        handleClose();
      }}
    >
      {content}
      {/* 取消按钮 */}
      <div
        className="popup-cacel"
        onClick={() => {
          handleClose();
        }}
      >
        取消
      </div>
    </Popup>
  );
};

ClassifyPopup.propTypes = {
  show: PropTypes.bool.isRequired, // 限定visible的类型为bool,且是必传的
  category: PropTypes.array, // 分类数据
  onVisibleChange: PropTypes.func,
  onChange: PropTypes.func,
};

// 设置props默认类型
ClassifyPopup.defaultProps = {
  show: false,
  category: [],
  onVisibleChange: () => { },
  onChange: () => {},
};

export default inject('threadPost')(observer(withRouter(ClassifyPopup)));
