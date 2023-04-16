import React, { Component } from 'react';
import styles from './index.module.scss';
import { Spin, Input, Icon, Dialog, Toast, Button } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import Header from '@components/header';
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
      return <div className={`${styles.additionValue} ${styles.additionNormalText}`}>{'未填写'}</div>;
    switch (type) {
      case 0:
        return <div className={`${styles.additionValue} ${styles.singleText}`}>{item.fieldsExt}</div>;
        break;
      case 1:
        return <div className={`${styles.additionValue} ${styles.mutipleLineText}`}>{item.fieldsExt}</div>;
        break;
      case 2:
        return <div className={styles.additionValue}>{this.getRadioFieldValue(fieldsExt.options || [])}</div>;
        break;
      case 3:
        return (
          <div className={styles.checkboxValue}>
            {(fieldsExt.options || []).map((d, i) => (
              <div key={`${d.value}-${i}`} className={styles.additionValue}>
                {d.value}
              </div>
            ))}
          </div>
        );
        break;
      case 4:
        return (
          <div className={styles.cardItem}>
            {fieldsExt &&
              fieldsExt.length &&
              fieldsExt.map((d, i) => {
                return (
                  <div
                    key={`${d.name}-${i}`}
                    className={`${styles.identityCard} ${i != fieldsExt.length - 1 && styles.identityCardBottom}`}
                  >
                    <img src={d.url} className={styles.identityImg} alt={d.name || '图片'} />
                  </div>
                );
              })}
          </div>
        );
        break;
      case 5:
        return (
          <div className={styles.additionValue}>
            <Icon size={16} color={'#8490A8'} name="PaperClipOutlined" />
            <span className={styles.additionFile}>附件已上传</span>
          </div>
        );
        break;
      default:
        break;
    }
  };

  render() {
    return (
      <>
        <Header />
        <div className={styles.additionalWrapper}>
          <div className={styles.additionalContainer}>
            {/* 头部区域 */}
            <div className={styles.title}>
              <span className={styles.titleValue}>您的补充信息已设置</span>
            </div>
            {this.state.isLoadingAdditionalInfo && (
              <div className={styles.additionInfoLoading}>
                <Spin type="spinner">加载中...</Spin>
              </div>
            )}
            {!this.state.isLoadingAdditionalInfo && (
              <>
                {/* 内容区域 */}
                <div className={styles.additionalContent}>
                  {this.props.user?.userSigninFields.map((item) => (
                    <div
                      key={`${item.id}`}
                      className={`${styles.additionItem} ${
                        item.type === 4 && item.fieldsExt && styles.additionIdentityCard
                      }`}
                      style={{ alignItems: (item.type === 1 || item.type === 3) && 'flex-start' }}
                    >
                      <div className={styles.additionLabel}>{item.name}</div>
                      {this.renderAdditionalItem(item)}
                    </div>
                  ))}
                </div>
                {/* 提示 */}
                <p className={styles.additionTips}>
                  <span className={styles.note}>*</span>补充信息设置后不能修改，如有疑问请联系站长处理
                </p>
              </>
            )}
          </div>
        </div>
      </>
    );
  }
}
