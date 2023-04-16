import React from 'react';
import classnames from 'classnames';
import { Checkbox } from '@discuzqsdk/design';
import styles from '../index.module.scss';

export default class ShopProductItemWebInstance extends React.Component {
  constructor(props) {
    super(props);
  }

  onChange = () => {
    this.props.onSelected(!this.props.isSelected);
  };

  render() {
    const { isSelected = false, isMini } = this.props;
    const { productId, imagePath, price, title } = this.props.productInfo;
    return (
      <div
        className={classnames(styles.productItem, {
          [styles.productItemMini]: isMini,
        })}
        onClick={this.onChange}
      >
        <Checkbox checked={isSelected} onChange={this.onChange} />
        <div className={styles.productItemBackgroundWrapper}>
          <div className={styles.productItemWrapper}>
            <div className={styles.productPic}>
              <img src={imagePath} />
            </div>
            <div className={styles.productInfoWrapper}>
              <span className={styles.productInfoId}>{productId}</span>
              <div className={styles.productInfoTitle}>{title}</div>
              <div className={styles.productInfoPrice}>￥{price}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
