import React from 'react';
import styles from './index.module.scss';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import Dialog from '@discuzqsdk/design/dist/components/dialog/index';
import Divider from '@discuzqsdk/design/dist/components/divider/index';
import { inject, observer } from 'mobx-react';
import { View, Text } from '@tarojs/components';
import { STEP_MAP } from '../../../../../common/constants/payBoxStoreConstants';
import Taro from '@tarojs/taro';
import throttle from '@common/utils/thottle.js';

@inject('site')
@inject('user')
@inject('payBox')
@observer
class PayPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      isShow: false,
    };
    this.keyboardClickHander = this.keyboardClickHander.bind(this);
    this.renderPwdItem = this.renderPwdItem.bind(this);
  }

  initState = () => {
    this.setState({
      list: [],
      isShow: false,
    });
  };

  componentDidMount() {
    this.setState({
      isShow: true,
    });
  }

  componentWillUnmount() {
    this.initState();
  }

  keyboardClickHander(e) {
    // const key = e.target.getAttribute('data-key');
    const key = e.target.dataset?.key;
    if (key == null) {
      return null;
    }
    const { list = [] } = this.state;

    if (key === '-1') {
      if (list.length === 0) {
        this.handleCancel();
      } else {
        this.setState({
          list: list.slice(0, list.length - 1),
        });
      }
    } else if (list.length < 6) {
      this.setState(
        {
          list: [].concat(list, [key]),
        },
        () => {
          if (this.state.list.length === 6) {
            this.submitPwa();
          }
        },
      );
    }
  }

  // 点击取消或者关闭---回到上个页面
  handleCancel = () => {
    this.props.payBox.step = STEP_MAP.PAYWAY;
    this.initState();
  };

  handleForgetPayPwd = throttle(() => {
    if (!this.props.user.mobile) {
      Toast.error({
        content: '需要首先绑定手机号才能进行此操作',
        duration: 2000,
        onClose: () => {
          // TODO: 回跳逻辑补充
          this.props.payBox.visible = false;
          Taro.navigateTo({ url: '/userPages/user/bind-phone/index?from=paybox' });
        },
      });
      return;
    }
    Taro.navigateTo({
      url: '/userPages/my/edit/find/paypwd/index?type=paybox',
    });
    this.props.payBox.step = null;
    this.props.payBox.visible = false;
  }, 1000);

  async submitPwa() {
    let { list = [] } = this.state;
    let pwd = list.join('');
    this.props.payBox.password = pwd;
    if (this.props.payBox.step === STEP_MAP.WALLET_PASSWORD) {
      // 表示钱包支付密码
      try {
        await this.props.payBox.walletPayOrder();
        this.initState();
        Toast.success({
          content: '支付成功',
          hasMask: false,
          duration: 1000,
        });
        this.props.payBox.visible = false;
        setTimeout(() => {
          // 清空密码
          this.props.payBox.clear();
        }, 500);
      } catch (error) {
        Toast.error({
          content: error.Message || '支付失败，请重新输入',
          hasMask: false,
          duration: 1000,
        });
        this.setState({
          list: [],
        });
      }
    }
  }

  renderPwdItem() {
    const { list = [] } = this.state;
    const { whetherIsShowPwdBox = true } = this.props;
    const nodeList = list.map((item, key) => (
      <View
        className={`${styles.payListItem} ${styles.activation} ${whetherIsShowPwdBox && styles.payListItem01}`}
        key={key}
      >
        {'●'}
      </View>
    ));
    if (nodeList.length < 6) {
      let curr = false;
      for (let i = nodeList.length; i < 6; i++) {
        if (!curr) {
          curr = true;
          nodeList.push(
            <View
              className={`${styles.payListItem} ${styles.curr} ${whetherIsShowPwdBox && styles.payListItem01}`}
              key={i}
            ></View>,
          );
        } else {
          nodeList.push(
            <View className={`${styles.payListItem} ${whetherIsShowPwdBox && styles.payListItem01}`} key={i}></View>,
          );
        }
      }
    }

    return nodeList;
  }

  // 渲染弹窗形式支付
  renderDialogPayment = () => {
    const { isShow } = this.state;
    const { options = {} } = this.props?.payBox;
    const IS_MOBILE_SERVICE_OPEN = this.props.site.isSmsOpen;
    const IS_USER_BIND_MOBILE = this.props.user?.mobile;
    return (
      <View>
        <Dialog
          className={styles.paypwdDialogWrapper}
          visible={this.props.payBox.visible && this.props.payBox.step === STEP_MAP.WALLET_PASSWORD}
          position="center"
          maskClosable={true}
        >
          <View className={styles.paypwdDialogContent}>
            <>
              <View className={styles.paypwdTitle}>立即支付</View>
              <View className={styles.paypwdAmount}>
                <Text className={styles.moneyUnit}>￥</Text>
                {Number(options.amount).toFixed(2)}
              </View>
              <Divider className={styles.paypwdDivider} />
              <View className={styles.paypwdMesg}>
                <Text className={styles.payText}>支付方式</Text>
                <View>
                  <Icon className={styles.walletIcon} name="PurseOutlined" />
                  <Text style={{ verticalAlign: 'middle' }}>钱包支付</Text>
                </View>
              </View>
              <View className={styles.paypwdMesg}>
                <Text className={styles.payText}>支付密码</Text>
              </View>
              <View className={styles.payList}>{this.renderPwdItem()}</View>
            </>

            <View className={styles.forgetPasswordContainer} onClick={this.handleForgetPayPwd}>
              {IS_MOBILE_SERVICE_OPEN && <Text>忘记支付密码?</Text>}
            </View>

            {/* 关闭按钮 */}
            <View className={styles.payBoxCloseIcon} onClick={this.handleCancel}>
              <Icon name="CloseOutlined" size={12} />
            </View>
          </View>
        </Dialog>
      </View>
    );
  };

  render() {
    const { list = [] } = this.state;
    return (
      <View className={styles.numkeyboard}>
        {this.renderDialogPayment()}
        <View className={styles.keyboard} onClick={this.keyboardClickHander}>
          <View className={styles.line}>
            <View data-key="1" className={styles.column}>
              1
            </View>
            <View data-key="2" className={styles.column}>
              2
            </View>
            <View data-key="3" className={styles.column}>
              3
            </View>
          </View>
          <View className={styles.line}>
            <View data-key="4" className={styles.column}>
              4
            </View>
            <View data-key="5" className={styles.column}>
              5
            </View>
            <View data-key="6" className={styles.column}>
              6
            </View>
          </View>
          <View className={styles.line}>
            <View data-key="7" className={styles.column}>
              7
            </View>
            <View data-key="8" className={styles.column}>
              8
            </View>
            <View data-key="9" className={styles.column}>
              9
            </View>
          </View>
          <View className={styles.line}>
            <View className={`${styles.column} ${styles.special}`}></View>
            <View data-key="0" className={styles.column}>
              0
            </View>
            <View data-key="-1" className={`${styles.column} ${styles.special}`}>
              <Icon name="BackspaceOutlined" size={18} />
            </View>
          </View>
        </View>
      </View>
    );
  }
}

// eslint-disable-next-line new-cap
export default PayPassword;
