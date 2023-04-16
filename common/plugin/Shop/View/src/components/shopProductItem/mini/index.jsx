import React from 'react';
import { View, Image } from '@tarojs/components';
import { Checkbox } from '@discuzqsdk/design';
import styles from '../index.module.scss';
import classnames from 'classnames';

export default class ShopProductItemWebInstance extends React.Component {
  constructor(props) {
    super(props);
  }

  onChange = () => {
    this.props.onSelected(!this.props.isSelected);
  };

  render() {
    const { isSelected = false } = this.props;
    const { productId, imagePath, price, title } = this.props.productInfo;
    return (
      <View className={classnames(styles.productItem, styles.productItemMini)} onClick={this.onChange}>
        <Checkbox checked={isSelected} onChange={this.onChange} />
        <View className={styles.productItemBackgroundWrapper}>
          <View className={styles.productItemWrapper}>
            <View className={styles.productPic}>
              <Image src={imagePath} />
            </View>
            <View className={styles.productInfoWrapper}>
              <View className={styles.productInfoId}>{productId}</View>
              <View className={styles.productInfoTitle}>{title}</View>
              <View className={styles.productInfoPrice}>￥{price}</View>
            </View>
          </View>
        </View>
      </View>
    );
  }
}
