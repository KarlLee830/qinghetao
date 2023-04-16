/**
 * 图片选择组件
 * @prop {array} data 数据
 * @prop {function} addPicture 添加图片
 * @prop {function} deletePicture 删除图片
 */
import React, { memo, useState, useEffect } from 'react';
import { Icon } from '@discuzqsdk/design';
import styles from './index.module.scss';
import PropTypes from 'prop-types';

const PictureSelect = ({
  data = [],
  limit = 9, // 发帖传图最大值
  addPicture,
  deletePicture,
}) => {
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(data);
  }, [data])

  return (
    <div className={styles.wrapper}>
      <div className={styles['picture-wrap']}>
        {/* 图片展示区 */}
        {
          list.map((item, index) => {
            const { id, path } = item
            return (
              <div className={styles['picture-item']} key={id}>
                <img
                  className={styles.image}
                  src={path}
                  alt="picture"
                />
                <div className={styles.btn} onClick={() => deletePicture(index)}>
                  <Icon name="CloseCircleOutlined" size={12} color="#fff" />
                </div>
              </div>
            )
          })
        }
        {/* 图片添加框 */}
        {list.length < limit &&
          <div className={styles['add-box']} onClick={addPicture}>
            <Icon name="PlusOutlined" size={20} color="#b5b5b5" />
          </div>
        }
      </div>
    </div>
  )
}

PictureSelect.propTypes = {
  data: PropTypes.array,
  limit: PropTypes.number,
  addPicture: PropTypes.func,
  deletePicture: PropTypes.func,
}

PictureSelect.defaultProps = {
  addPicture: () => { console.log('未添加新增图片事件') },
  deletePicture: () => { console.log('未添加删除图片事件') }
}

export default memo(PictureSelect);

