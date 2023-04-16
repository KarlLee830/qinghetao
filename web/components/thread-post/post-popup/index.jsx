/**
 * 发帖页弹出层
 */
import React, { memo } from 'react'; // 性能优化的
import { Popup } from '@discuzqsdk/design';// 原来就有的封装
import PropTypes from 'prop-types';// 类型拦截
import styles from './index.module.scss';// 私有样式

const PostPopup = ({ list, onClick, cancel, visible }) => {
  const handlePopup = (item) => {
    onClick(item);
    cancel();
  };// 自己定义用来调用传进来的方法的

  return (
    <Popup
      position="bottom"// 从哪个地方弹出 'bottom' | 'top' | 'center';
      maskClosable={true}// 点击遮罩层是否关闭弹出层，但好像没什么用
      visible={visible}// 是否显示弹出层
      onClose={() => { // 遮罩层点击关闭回调,传一个'取消'，可自定义更改
        cancel();
      }}
    >
      {/* 循环渲染传进来的数组 */}
      <div className={styles.container}>
        <div className={styles.list}>
          {list.map(item => (
              <p
                className={styles.item}
                key={item}
                onClick={() => {
                  handlePopup(item);
                }}
              >
                {item}
              </p>
          ))}
        </div>
        {/* 取消按钮 */}
        <p
          className={styles.cancel}
          onClick={() => {
            cancel();
          }}
        >
          取消
        </p>
      </div>
    </Popup>
  );
};

PostPopup.propTypes = {
  list: PropTypes.array.isRequired, // 限定list的类型为Array,且是必传的
  visible: PropTypes.bool.isRequired, // 限定visible的类型为bool,且是必传的
  onClick: PropTypes.func, // 限定onClick的类型为functon,且是必传的
};

// 设置props默认类型
PostPopup.defaultProps = {
  list: ['保存草稿', '不保存'],
};

export default memo(PostPopup);
