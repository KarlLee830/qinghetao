import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import Header from '@components/header';
import Copyright from '@components/copyright';
import { Dropdown, Icon, Toast } from '@discuzqsdk/design';
import WalletInfo from './components/wallet-info/index';
import RecordList from './components/record-list/index';
import NoMore from './components/no-more';
import Tabs from './components/tabs';
import WithdrawalPop from './components/withdrawal-popup';
import layout from './layout.module.scss';
import { INCOME_DETAIL_CONSTANTS, EXPAND_DETAIL_CONSTANTS, CASH_DETAIL_CONSTANTS } from '@common/constants/wallet';
import { typeFilter } from './adapter';
import { formatDate } from '@common/utils/format-date.js';
import DatePicker from 'react-datepicker';
import List from '@components/list';
// react-datepicker 中文化使用，参考：https://stackoverflow.com/questions/54399084/change-locale-in-react-datepicker
import zhCN from 'date-fns/locale/zh-CN';
import 'react-datepicker/dist/react-datepicker.css';
import classnames from 'classnames';
import BaseLayout from '@components/base-layout';

@inject('site')
@inject('wallet')
@observer
class ThreadPCPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeType: 'income', // 当前激活的状态类型
      showWithdrawalPopup: false, // 提现弹框是否显示
      operateWalletType: '', // 提现or充值
      page: 1,
      totalPage: 1,
      totalCount: null,
      selectType: 'all', // 筛选类型
      consumptionTime: new Date(),
      datePickerOpen: false,
    };
  }

  async componentDidMount() {
    const { getUserWalletInfo } = this.props.wallet;
    // 获取钱包信息
    await getUserWalletInfo();
  }

  componentWillUnmount = async () => {
    this.setState({
      page: 1,
      totalPage: 1,
    });
    this.props.wallet.resetInfo();
  }

  initStateAndFetch = () => {
    this.setState(
      {
        page: 1,
        totalPage: 1,
      },
      () => {
        switch (this.state.activeType) {
          case 'income':
            this.fetchIncomeDetail();
            break;
          case 'pay':
            this.fetchExpendDetail();
            break;
          case 'withdrawal':
            this.fetchCashDetail();
            break;
          case 'frozen':
            this.fetchFreezeDetail();
            break;
        }
      },
    );
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
        totalCount: detailRes.totalCount,
      };
      if (this.state.page <= pageState.totalPage) {
        Object.assign(pageState, {
          page: this.state.page + 1,
        });
      }
      this.setState(pageState);
    } catch (e) {
      if (e.Code) {
        Toast.error({
          content: e.Msg,
          duration: 2000,
        });
      }
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
      totalCount: detailRes.totalCount,
    };
    if (this.state.page <= pageState.totalPage) {
      Object.assign(pageState, {
        page: this.state.page + 1,
      });
    }
    this.setState(pageState);
  };

  fetchCashDetail = async () => {
    const detailRes = await this.props.wallet.getCashLog({
      page: this.state.page,
      type: this.state.selectType,
      date: this.state.consumptionTime,
    });
    const pageState = {
      totalPage: detailRes.totalPage,
      totalCount: detailRes.totalCount,
    };
    if (this.state.page <= pageState.totalPage) {
      Object.assign(pageState, {
        page: this.state.page + 1,
      });
    }
    this.setState(pageState);
  };

  fetchFreezeDetail = async () => {
    const freezeRes = await this.props.wallet.getFreezeDetail();
    const { totalCount, totalPage } = freezeRes;
    const pageData = {
      totalCount,
      totalPage,
    };
    if (this.state.page <= totalPage) {
      pageData.page = this.state.page + 1;
    }
    this.setState(pageData);
  };

  // 切换选项卡
  handleTriggerSelectedTypes = (val) => {
    this.setState({
      activeType: val,
    });
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

  // 点击提现or充值
  operateWallet = (operateType) => {
    this.setState({
      operateWalletType: operateType,
      showWithdrawalPopup: true
    });
  };

  // 提现到微信钱包
  moneyToWixin = (moneyNum) => {
    this.setState({ showWithdrawalPopup: false });
  };

  listRenderFreezeDataFilter = () => {
    if (Object.values(this.props.wallet.freezeDetail).length === 0) return [];
    return Object.values(this.props.wallet.freezeDetail).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  listRenderDataFilter = (data) => {
    const targetTypeData = typeFilter(data, this.state.selectType);
    const targetDateData = typeFilter(targetTypeData, formatDate(this.state.consumptionTime, 'yyyy-MM'));
    if (Object.keys(targetDateData).length === 0) return [];
    return Object.values(targetDateData).reduce((fullData, pageData) => [...fullData, ...pageData]);
  };

  // 获取recordData
  getRecordData = () => {
    const { incomeDetail = {}, expandDetail = {}, cashDetail = {} } = this.props.wallet;
    const incomeData = this.listRenderDataFilter(incomeDetail) || [];
    const expandData = this.listRenderDataFilter(expandDetail) || [];
    const cashData = this.listRenderDataFilter(cashDetail) || [];
    const frozenData = this.listRenderFreezeDataFilter() || [];

    if (this.state.activeType === 'income') {
      // 收入
      return incomeData;
    }
    if (this.state.activeType === 'pay') {
      return expandData;
    }
    if (this.state.activeType === 'withdrawal') {
      return cashData;
    }
    if (this.state.activeType === 'frozen') {
      return frozenData;
    }
  };

  // 点击冻结金额
  onFrozenAmountClick = () => {
    this.handleTriggerSelectedTypes('frozen');
  };

  // 点击菜单 选择不同类型
  handleChangeSelectedType = (value) => {
    this.setState(
      {
        selectType: value,
      },
      () => {
        this.initStateAndFetch();
      },
    );
  };

  // 提现关闭
  onClose = () => {
    this.setState({
      showWithdrawalPopup: false,
    });
  };

  renderDropdownMenu = () => {
    const data = this.renderSelectContent();
    return (
      <Dropdown.Menu defaultKey={['all']}>
        {data.map((item) => (
          <Dropdown.Item key={item.id} id={item.id}>
            {item.title}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    );
  };

  // 根据当前选项渲染下拉选择器内容
  renderSelectContent = () => {
    const defaultType = {
      id: 'all',
    };

    let dataSource = {};
    switch (this.state.activeType) {
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

  // 点击切换tag的显示
  renderSelectedType = () => {
    if (this.state.selectType === 'all') {
      if (this.state.activeType === 'withdrawal') {
        return '全部状态';
      }
      return '全部类型';
    }
    let arr = {};
    switch (this.state.activeType) {
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

  fetcher = () => {
    if (this.state.activeType === 'income') {
      return this.fetchIncomeDetail();
    } else if (this.state.activeType === 'pay') {
      return this.fetchExpendDetail();
    } else if (this.state.activeType === 'withdrawal') {
      return this.fetchCashDetail();
    } else if (this.state.activeType === 'frozen') {
      return this.fetchFreezeDetail();
    } else {
      return Promise.reject('没有找到此类型');
    }
  };

  renderRight = () => {
    const { walletInfo } = this.props.wallet;
    // 判断是否显示充值按钮，微信支付打开 && 充值权限打开
    const { isWechatPayOpen, webConfig } = this.props.site || {};
    const { siteCharge } = webConfig.setSite || {};
    const isShowRecharge = isWechatPayOpen && siteCharge === 1;
    return (
      <div className={layout.bodyRigth}>
        <div className={classnames(layout.walletInfo, {
          [layout['walletInfo-recharge']]: isShowRecharge
        })}>
          <WalletInfo
            walletData={walletInfo}
            webPageType="PC"
            operateWallet={this.operateWallet}
            onFrozenAmountClick={this.onFrozenAmountClick}
            isShowRecharge={isShowRecharge}
          ></WalletInfo>
        </div>
        <div className={layout.tabs}>
          <Tabs
            className="wallet-tabs"
            activeType={this.state.activeType}
            handleTriggerSelectedTypes={this.handleTriggerSelectedTypes}
          />
        </div>
        <div className={layout.copyright}>
          <Copyright />
        </div>
      </div>
    );
  };

  render() {
    const recordType = {
      income: '收入明细',
      pay: '支出明细',
      withdrawal: '提现记录',
      frozen: '冻结金额',
    };
    const { walletInfo } = this.props.wallet;
    const { activeType } = this.state;
    return (
      <BaseLayout
        right={this.renderRight()}
        immediateCheck={true}
        onRefresh={this.fetcher}
        showRefresh={false}
        noMore={this.state.page > this.state.totalPage}
        className={`mywallet-page ${layout.container}`}
      >
        <div className={layout.bodyLeft}>
          <div className={layout.header}>
            <div className={layout.headerTitle}>
              {activeType === 'income' ? <Icon name="TicklerOutlined" size="20" color="#3ac15f"></Icon> : ''}
              {activeType === 'pay' ? <Icon name="WallOutlined" size="20" color="#2469f6"></Icon> : ''}
              {activeType === 'withdrawal' ? <Icon name="TransferOutOutlined" size="20" color="#e02433"></Icon> : ''}
              <div className={activeType === 'frozen' ? '' : layout.title}>{recordType[activeType]}</div>
            </div>
          </div>
          <div className={layout.choice}>
            <div className={layout.choiceLeft}>
              {!(activeType === 'frozen') && (
                <>
                  <div className={layout.choiceType}>
                    <DatePicker
                      locale={zhCN}
                      selected={this.state.consumptionTime}
                      showMonthYearPicker
                      maxDate={new Date()}
                      onCalendarClose={() => {
                        this.setState({
                          datePickerOpen: false,
                        });
                      }}
                      onCalendarOpen={() => {
                        this.setState({
                          datePickerOpen: true,
                        });
                      }}
                      onChange={(date) => {
                        this.setState(
                          {
                            consumptionTime: date,
                          },
                          () => {
                            this.initStateAndFetch();
                          },
                        );
                      }}
                      dateFormat="yyyy年MM月"
                    />
                    <Icon
                      name={'RightOutlined'}
                      size={12}
                      className={classnames(layout.datePickerIcon, {
                        [layout.datePickerIconOpen]: this.state.datePickerOpen,
                      })}
                    />
                  </div>
                  <div className={layout.choiceType}>
                    <Dropdown
                      onChange={this.handleChangeSelectedType}
                      placement="right"
                      trigger="click"
                      menu={this.renderDropdownMenu()}
                    >
                      <div>{this.renderSelectedType()}</div>
                    </Dropdown>
                  </div>
                </>
              )}
              {activeType === 'frozen' && (
                <div className={layout.frozenText}>
                  <span>涉及金额</span>
                  <span className={layout.frozenAmount}>{walletInfo.freezeAmount} 元</span>
                </div>
              )}
            </div>
            {this.state.totalCount !== null && (
              <div className={layout.recordNumber}>共有{this.state.totalCount}条记录</div>
            )}
          </div>
          <RecordList data={this.getRecordData()} activeType={this.state.activeType}></RecordList>
        </div>
        {/* 提现弹框 */}
        <WithdrawalPop
          onCreateCash={() => {
            this.setState({
              page: 1,
              totalPage: 1,
            });
            this.props.wallet.resetInfo();
            this.fetcher()
          }}
          visible={this.state.showWithdrawalPopup}
          onClose={this.onClose}
          operateWalletType={this.state.operateWalletType}
        />
      </BaseLayout>
    );
  }
}

export default withRouter(ThreadPCPage);
