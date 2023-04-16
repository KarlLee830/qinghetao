import React, { Component } from 'react';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import { View, Text, Image } from '@tarojs/components';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Spin from '@discuzqsdk/design/dist/components/spin/index';

@inject('user')
@observer
export default class UserCenterAdditionalInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoadingAdditionalInfo: false, // 表示加载状态
    };
  }

  async componentDidMount() {
    try {
      this.setState({
        isLoadingAdditionalInfo: true,
      });
      await this.props.user.getUserSigninFields();
      this.setState({
        isLoadingAdditionalInfo: false,
      });
    } catch (error) {
      console.error(error);
    }
  }

  // 处理单选字段
  getRadioFieldValue = (data = []) => {
    const resultValue = [];
    data.map((i) => {
      if (i.checked) {
        resultValue.push(i.value);
      }
    });
    return resultValue.join('');
  };

  /**
   * 渲染每一条item
   * type 0 文本| 1 多行文本|2 单选|3 多选|4 图片|5 附件
   */
  renderAdditionalItem = (item) => {
    const { type, fieldsExt = [] } = item;
    if (!fieldsExt || (type === 2 && this.getRadioFieldValue(fieldsExt.options || []) === ''))
      return <View className={`${styles.additionValue} ${styles.additionNormalText}`}>{'未填写'}</View>;
    switch (type) {
      case 0:
        return <View className={`${styles.additionValue} ${styles.singleText}`}>{item.fieldsExt}</View>;
      case 1:
        return <View className={`${styles.additionValue} ${styles.mutipleLineText}`}>{item.fieldsExt}</View>;
      case 2:
        return <View className={styles.additionValue}>{this.getRadioFieldValue(fieldsExt.options || [])}</View>;
      case 3:
        return (
          <View className={styles.checkboxValue}>
            {(fieldsExt.options || []).map((d, i) => (
              <View key={`${d.value}-${i}`} className={styles.additionValue}>
                {d.value}
              </View>
            ))}
          </View>
        );
      case 4:
        return (
          <View className={styles.cardItem}>
            {fieldsExt?.map((d, i) => {
              return (
                <View
                  key={`${d.name}-${i}`}
                  className={`${styles.identityCard} ${i != fieldsExt.length - 1 && styles.identityCardBottom}`}
                >
                  <Image mode="widthFix" src={d.url} className={styles.identityImg} alt={d.name || '图片'} />
                </View>
              );
            })}
          </View>
        );
      case 5:
        return (
          <View className={styles.additionValue}>
            <Icon size={16} color={'#8490A8'} name="PaperClipOutlined" />
            <Text className={styles.additionFile}>附件已上传</Text>
          </View>
        );
      default:
        break;
    }
  };

  render() {
    return (
      <View className={styles.additionalWrapper}>
        <View className={styles.additionalContainer}>
          {/* 头部区域 */}
          <View className={styles.title}>
            <Text className={styles.titleValue}>您的补充信息已设置</Text>
          </View>
          {this.state.isLoadingAdditionalInfo && (
            <View className={styles.additionInfoLoading}>
              <Spin type="spinner">加载中...</Spin>
            </View>
          )}
          {!this.state.isLoadingAdditionalInfo && (
            <>
              {/* 内容区域 */}
              <View className={styles.additionalContent}>
                {this.props.user?.userSigninFields.map((item) => (
                  <View
                    key={item.id}
                    className={`${styles.additionItem} ${
                      item.type === 4 && item.fieldsExt && styles.additionIdentityCard
                    }`}
                    style={{ alignItems: (item.type === 1 || item.type === 3) && 'flex-start' }}
                  >
                    <View className={styles.additionLabel}>{item.name}</View>
                    {this.renderAdditionalItem(item)}
                  </View>
                ))}
              </View>
              {/* 提示 */}
              <View className={styles.additionTips}>
                <Text className={styles.note}>*</Text>补充信息设置后不能修改，如有疑问请联系站长处理
              </View>
            </>
          )}
        </View>
      </View>
    );
  }
}
