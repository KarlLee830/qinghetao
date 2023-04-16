import React from 'react';
import { inject, observer } from 'mobx-react';
import Tabs from '@discuzqsdk/design/dist/components/tabs/index';
import Icon from '@discuzqsdk/design/dist/components/icon/index';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { View, Text } from '@tarojs/components';
import classNames from 'classnames';
import Router from '@discuzqsdk/sdk/dist/router';
import Taro from '@tarojs/taro';

import Page from '@components/page';
import DatePickers from '@components/thread-post/date-time-picker';
import { formatDate } from '@common/utils/format-date.js';
import { INCOME_DETAIL_CONSTANTS, EXPAND_DETAIL_CONSTANTS, CASH_DETAIL_CONSTANTS } from '@common/constants/wallet';

import WalletInfo from './components/wallet-info/index';
import IncomeList from './components/income-list/index';
import PayList from './components/pay-list/index';
import WithdrawalList from './components/withdrawal-list/index';
import FilterView from './components/all-state-popup';
import { typeFilter } from './adapter';
import layout from './layout.module.scss';
import BaseLayout from '@components/base-layout';

@inject('wallet')
@inject('site')
@observer
class WalletH5Page extends React.Component {
  static options = {
    addGlobalClass: true,
  };

  constructor(props) {
    super(props);

    this.state = {
      visibleshow: false,
      consumptionTimeshow: false,
      consumptionTime: new Date(),
      page: 1,
      totalPage: 1,
      selectType: 'all', // 筛选类型
      initValue: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 时间选择框初始值
    };

    this.timeRef = React.createRef();
  }
  async componentDidMount() {
    const { getUserWalletInfo } = this.props.wallet;
    await getUserWalletInfo();
    this.initStateAndFetch();
  }

  componentWillUnmount() {
    this.props.wallet.setTabsType(); // 重置tab
  }

  // 点击冻结金额
  onFrozenAmountClick() {
    Router.push({ url: '/subPages/wallet/frozen/index' });
  }

  // 点击提现
  toWithdrawal = () => {
    Router.push({ url: '/subPages/wallet/withdrawal/index' });
  };

  // 点击充值
  toRecharge = () => {
    Taro.navigateTo({ url: '/subPages/wallet/recharge/index' });
  };

  // 切换选项卡
  onTabActive = (val) => {
    this.props.wallet.resetInfo()
    this.props.wallet.getUserWalletInfo();
    this.props.wallet.setTabsType(val);

    this.initSelectType(() => {
      this.initStateAndFetch();
    });
  };

  initSelectType = (callback) => {
    this.setState(
      {
        selectType: 'all',
      },
      callback,
    );
  };

  initStateAndFetch = () => {
    this.setState(
      {
        page: 1,
        totalPage: 1,
      },
      () => {
        switch (this.props.wallet.tabsType) {
          case 'income':
            this.fetchIncomeDetail();
            break;
          case 'pay':
            this.fetchExpendDetail();
            break;
          case 'withdrawal':
            this.fetchCashDetail();
            break;
        }
      },
    );
  };

  // 加载更多
  loadMore = () => {
    switch (this.props.wallet.tabsType) {
      case 'income':
        return this.fetchIncomeDetail();
      case 'pay':
        return this.fetchExpendDetail();
      case 'withdrawal':
        return this.fetchCashDetail();
    }
  };

  handleTimeSelectorClick = () => {
    this.setState({ consumptionTimeshow: true });
  };

  handleTypeSelectorClick = () => {
    this.setState({ visibleshow: true });
  };

  // 关闭全部状态的弹框
  handleStateCancel = () => {
    this.setState({ visibleshow: false });
  };

  handleTypeChange = (id) => {
    this.setState(
      {
        selectType: id,
      },
      () => {
        this.initStateAndFetch();
      },
    );
  };

  handleDataPickerCancel = () => {
    this.setState({ consumptionTimeshow: !this.state.consumptionTimeshow });
  };

  // 点击确定后对时间选择的弹框的操作
  handleMoneyTime = (time) => {
    // 获得的time是当前时间的一天后
    const gapTime = new Date(time).getTime() - new Date().getTime() - 24 * 60 * 60 * 1000;
    if (gapTime < 0) {
      this.setState({ consumptionTime: time }, () => {
        this.initStateAndFetch();
      });
      this.setState({ consumptionTimeshow: false });
    } else {
      Toast.warning({ content: '时间要小于等于当前时间' });
      return;
    }
  };

  // 根据当前选项渲染下拉选择器内容
  renderSelectContent = () => {
    const defaultType = {
      id: 'all',
    };

    let dataSource = {};
    switch (this.props.wallet.tabsType) {
      case 'income':
        dataSource = INCOME_DETAIL_CONSTANTS;
        defaultType.title = '全部类型';
        break;
      case 'pay':
        dataSource = EXPAND_DETAIL_CONSTANTS;
        defaultType.title = '全部类型';
        break;
      case 'withdrawal':
        dataSource = CASH_DETAIL_CONSTANTS;
        defaultType.title = '全部状态';
    }

    const dataSourceArray = Object.values(dataSource).map((item) => ({ title: item.text, id: item.code }));

    dataSourceArray.unshift(defaultType);

    return dataSourceArray;
  };

  renderSelectTitle = () => {
    switch (this.props.wallet.tabsType) {
      case 'income':
      case 'pay':
        return '选择类型';
      case 'withdrawal':
        return '选择状态';
    }
  };

  openTimePicker = () => {
    // 开启时间选择框
    const { openModal } = this.timeRef.current;
    openModal();
  };

  fetchIncomeDetail = async () => {
    try {
      const detailRes = await this.props.wallet.getIncomeDetail({
        page: this.state.page,
        type: this.state.selectType,
        date: this.state.consumptionTime,
      });
      const pageState = {
        totalPage: detailRes.totalPage,
      };
      if (this.state.page <= pageState.totalPage) {
        Object.assign(pageState, {
          page: this.state.page + 1,
        });
      }
      this.setState(pageState);
      return;
    } catch (e) {
      console.error(e);
      if (e.Code) {
        Toast.error({
          content: e.Msg,
          duration: 2000,
        });
      }
      return Promise.reject();
    }
  };

  fetchExpendDetail = async () => {
    const detailRes = await this.props.wallet.getExpendDetail({
      page: this.state.page,
      type: this.state.selectType,
      date: this.state.consumptionTime,
    });
    const pageState = {
      totalPage: detailRes.totalPage,
    };
    if (this.state.page <= pageState.totalPage) {
      Object.assign(pageState, {
        page: this.state.page + 1,
      });
    }
    this.setState(pageState);
    return;
  };

  fetchCashDetail = async () => {
    const detailRes = await this.props.wallet.getCashLog({
      page: this.state.page,
      type: this.state.selectType,
      date: this.state.consumptionTime,
    });
    const pageState = {
      totalPage: detailRes.totalPage,
    };
    if (this.state.page <= pageState.totalPage) {
      Object.assign(pageState, {
        page: this.state.page + 1,
      });
    }
    this.setState(pageState);
    return;
  };

  listRenderDataFilter = (data) => {
    const targetTypeData = typeFilter(data, this.state.selectType);
    const targetDateData = typeFilter(targetTypeData, formatDate(this.state.consumptionTime, 'yyyy-MM'));
    if (Object.keys(targetDateData).length === 0) return [];
    return Object.values(targetDateData).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  // 点击切换tag的显示
  renderSelectedType = () => {
    const { tabsType } = this.props.wallet;
    if (this.state.selectType === 'all') {
      return tabsType === 'withdrawal' ? '全部状态' : '全部类型';
    }
    let arr = {};
    switch (tabsType) {
      case 'income':
        arr = INCOME_DETAIL_CONSTANTS;
        break;
      case 'pay':
        arr = EXPAND_DETAIL_CONSTANTS;
        break;
      case 'withdrawal':
        arr = CASH_DETAIL_CONSTANTS;
    }
    for (const key in arr) {
      if (arr[key].code === this.state.selectType) {
        return arr[key].text || '';
      }
    }
  };

  getStatusBarHeight() {
    return wx?.getSystemInfoSync()?.statusBarHeight || 44;
  }

  // 全屏状态下自定义左上角返回按钮位置
  getTopBarBtnStyle() {
    return {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '12px',
      transform: 'translate(0, 10px)',
    };
  }

  getTopBarTitleStyle() {
    return {
      position: 'fixed',
      top: `${this.getStatusBarHeight()}px`,
      left: '50%',
      transform: 'translate(-50%, 8px)',
    };
  }

  handleBack = () => {
    Taro.navigateBack();
  };

  // 获取钱包中对应列表数据
  getWalletList = () => {
    const { tabsType, incomeDetail = {}, expandDetail = {}, cashDetail = {} } = this.props.wallet;
    const incomeData = this.listRenderDataFilter(incomeDetail) || [];
    const expandData = this.listRenderDataFilter(expandDetail) || [];
    const cashData = this.listRenderDataFilter(cashDetail) || [];
    let list = [];
    switch (tabsType) {
      case 'income':
        list = incomeData;
        break;
      case 'pay':
        list = expandData;
        break;
      case 'withdrawal':
        list = cashData;
        break;
    }
    return list;
  };

  // 渲染顶部title
  renderTitleContent = () => (
    <View className={layout.topBarTitle}>
      <View onClick={this.handleBack} className={layout.customCapsule} style={this.getTopBarBtnStyle()}>
        <Icon size={18} name="LeftOutlined" />
      </View>
      <View style={this.getTopBarTitleStyle()} className={layout.fullScreenTitle}>
        我的钱包
      </View>
    </View>
  );

  render() {
    // 判断是否显示充值按钮，微信支付打开 && 充值权限打开 && 小程序设置了开启充值
    const { isWechatPayOpen, webConfig } = this.props.site || {};
    const { siteCharge } = webConfig.setSite || {};
    const { threadOptimize } = webConfig.other || {};
    const isShowRecharge = isWechatPayOpen && siteCharge === 1 && threadOptimize;
    const { tabsType, walletInfo } = this.props.wallet;
    const tabList = [
      [
        'income',
        <View className={layout.tagbox} key="income">
          <Icon
            name="TicklerOutlined"
            className={classNames(layout.tag, {
              [layout['tag-active-green']]: tabsType !== 'income',
            })}
          />
          收入明细
        </View>,
        { name: 'TicklerOutlined' },
      ],
      [
        'pay',
        <View className={layout.tagbox} key="pay">
          <Icon
            name="WallOutlined"
            className={classNames(layout.tag, {
              [layout['tag-active-blue']]: tabsType !== 'pay',
            })}
          />
          支出明细
        </View>,
        { name: 'WallOutlined' },
      ],
      [
        'withdrawal',
        <View className={layout.tagbox} key="withdrawal">
          <Icon
            name="TransferOutOutlined"
            className={classNames(layout.tag, {
              [layout['tag-active-red']]: tabsType !== 'withdrawal',
            })}
          />
          提现记录
        </View>,
        { name: 'TransferOutOutlined' },
      ],
    ];

    return (
      <Page>
        <BaseLayout
          noMore={this.state.page > this.state.totalPage}
          onRefresh={this.loadMore}
          listClassName={classNames(layout.walletWrapper, {
            [layout.walletWrapperRecharge]: isShowRecharge,
          })}
          immediateCheck
          showHeader={false}
          showLoadingInCenter={!this.getWalletList().length}
        >
          <View className={layout.header}>
            {this.renderTitleContent()}
            <WalletInfo
              walletData={walletInfo}
              webPageType="h5"
              onFrozenAmountClick={() => this.onFrozenAmountClick()}
            ></WalletInfo>
          </View>
          <View className={layout.choiceTime}>
            <View className={layout.status} onClick={this.handleTypeSelectorClick}>
              <Text className={layout.text}>{this.renderSelectedType()}</Text>
              <Icon name="UnderOutlined" size={12} className={layout.icon}></Icon>
            </View>
            <View className={layout.status} onClick={this.openTimePicker}>
              <Text className={layout.text}>
                {formatDate(this.state.consumptionTime, 'yyyy年MM月') || formatDate(new Date(), 'yyyy年MM月')}
              </Text>
              <Icon name="UnderOutlined" size={12} className={layout.icon}></Icon>
            </View>
          </View>
          {/* 列表展示区 */}
          <View className={layout.tabs}>
            <Tabs activeId={tabsType} scrollable className={layout.tabList} onActive={this.onTabActive}>
              {tabList.map(([id, label, icon]) => (
                <Tabs.TabPanel key={id} id={id} label={label} name={icon.name}></Tabs.TabPanel>
              ))}
            </Tabs>
            {tabsType === 'income' &&
              this.getWalletList().map((value, index) => (
                <IncomeList key={value.id} incomeVal={value} itemKey={index} dataLength={this.getWalletList().length} />
              ))}
            {tabsType === 'pay' &&
              this.getWalletList().map((value, index) => (
                <PayList key={value.id} payVal={value} itemKey={index} dataLength={this.getWalletList().length} />
              ))}
            {tabsType === 'withdrawal' &&
              this.getWalletList().map((value, index) => (
                <WithdrawalList
                  key={value.id}
                  withdrawalVal={value}
                  itemKey={index}
                  dataLength={this.getWalletList().length}
                />
              ))}
          </View>
        </BaseLayout>
        <View className={layout.footer}>
          {
            isWechatPayOpen && threadOptimize && (
              <Button className={layout.button} onClick={this.toWithdrawal} type="primary">
                提现
              </Button>
            )
          }
          {isShowRecharge && (
            <Button className={layout.button} onClick={this.toRecharge} type="primary">
              充值
            </Button>
          )}
        </View>
        {/* 条件过滤 */}
        <FilterView
          value={this.state.selectType}
          data={this.renderSelectContent()}
          title={this.renderSelectTitle()}
          visible={this.state.visibleshow}
          handleCancel={this.handleStateCancel}
          handleSubmit={this.handleTypeChange}
        />
        {/* 时间选择器 */}
        <DatePickers
          ref={this.timeRef}
          onConfirm={this.handleMoneyTime}
          initValue={this.state.initValue}
          disabledTime
          type="wallet"
        />
      </Page>
    );
  }
}

export default WalletH5Page;
