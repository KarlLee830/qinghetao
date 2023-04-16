import { action } from 'mobx';
import WalletStore from './store';
import { readWalletUser, readWalletLog, readWalletCash, createWalletCash } from '@server';
import time from '@discuzqsdk/sdk/dist/time';
import { get } from '@common/utils/get';
import { INCOME_DETAIL_CONSTANTS, EXPAND_DETAIL_CONSTANTS, FREEZE_TYPE } from '@common/constants/wallet';
import rechargePay from '@common/pay-bussiness/recharge-pay';

const setWalletInfoPageData = (data, obj, {
  type,
  date,
  page,
}) => {
  let newData = data

  newData.pageData = newData.pageData.map(item => {
    item.changeDesc = getTypeStr(item.changeType) || item.changeDesc
    return item
  })

  if (!obj[type] || page === 1) {
    obj[type] = {};
  }
  if (!obj[type][date]) {
    obj[type][date] = {};
  }
  if (!obj[type][date][page]) {
    obj[type][date][page] = get(newData, 'pageData', []);
  }

  obj = {...obj}
};

const getTypeStr = (code) => {
  let text = ''

  const incomes = Object.values(INCOME_DETAIL_CONSTANTS)
  const expands = Object.values(EXPAND_DETAIL_CONSTANTS)

  // 暂时不需要冻结类型，需要注意
  // const freezes = Object.values(FREEZE_TYPE)

  const types = [...incomes, ...expands]
  for (let index = 0; index < types.length; index++) {
    const element = types[index];

    const codes = `${element.code}`.split(',').map(i => `${i}`)
    if (codes.indexOf(`${code}`) !== -1) {
      text = element.text
      break
    }
  }

  return text
}

class WalletAction extends WalletStore {
    @action
    setTabsType = (type = 'income') => {
      this.tabsType = type;
    }

    @action
    resetInfo = () => {
      // 收入明细
      this.incomeDetail = {}
      // 支出明细
      this.expandDetail = {}
      // 冻结明细
      this.freezeDetail = {}
      // 提现明细
      this.cashDetail = {}
    }

    @action
    getUserWalletInfo = async () => {
      const walletInfoRes = await readWalletUser();
      if (walletInfoRes.code === 0) {
        this.walletInfo = walletInfoRes.data;
      }
    }

    // 获取收入明细
    @action
    getIncomeDetail = async ({ ...props }) => {
      const { page = 1, date = time.formatDate(new Date(), 'YYYY-MM'), type = 'all' } = props;
      const param = {
        walletLogType: 'income',
        page,
        perPage: 22,
      };
      const filter = {
        startTime: time.getMonthStartAndEnd(date)[0],
        endTime: time.getMonthStartAndEnd(date)[1],
      };
      if (type !== 'all') {
        filter.changeType = String(type).split(',');
      }

      Object.assign(param, {
        filter,
      });
      const detailInfoRes = await readWalletLog({
        params: param,
      });

      if (detailInfoRes.code === 0) {
        setWalletInfoPageData(detailInfoRes.data, this.incomeDetail, {
          type,
          date: time.formatDate(date, 'YYYY-MM'),
          page,
        });

        return detailInfoRes.data;
      }

      throw {
        Code: detailInfoRes.code,
        Msg: detailInfoRes.Msg,
      };
    }

    // 获取支出明细
    @action
    getExpendDetail = async ({ ...props }) => {
      const { page = 1, date = time.formatDate(new Date(), 'YYYY-MM'), type = 'all' } = props;
      const param = {
        walletLogType: 'expend',
        page,
        perPage: 22,
      };
      const filter = {
        startTime: time.getMonthStartAndEnd(date)[0],
        endTime: time.getMonthStartAndEnd(date)[1],
      };
      if (type !== 'all') {
        filter.changeType = String(type).split(',');
      }
      Object.assign(param, {
        filter,
      });

      const detailInfoRes = await readWalletLog({
        params: param,
      });

      if (detailInfoRes.code === 0) {
        setWalletInfoPageData(detailInfoRes.data, this.expandDetail, {
          type,
          date: time.formatDate(date, 'YYYY-MM'),
          page,
        });

        return detailInfoRes.data;
      }

      throw {
        Code: detailInfoRes.code,
        Msg: detailInfoRes.Msg,
      };
    }

    // 获取冻结明细
    @action
    getFreezeDetail = async ({ ...props }) => {
      const { page = 1 } = props;
      const detailInfoRes = await readWalletLog({
        params: {
          walletLogType: 'freeze',
          page,
          perPage: 22,
        },
      });

      if (detailInfoRes.code === 0) {
        this.freezeDetail[page] = get(detailInfoRes, 'data.pageData', []);

        this.freezeDetail = {
          ...this.freezeDetail,
        };

        return detailInfoRes.data;
      }

      throw {
        Code: detailInfoRes.code,
        Msg: detailInfoRes.Msg,
      };
    }

    // 获取提现明细
    @action
    getCashLog = async ({ ...props }) => {
      const { page = 1, date = time.formatDate(new Date(), 'YYYY-MM'), type = 'all' } = props;
      const param = {
        page,
        perPage: 22,
      };

      const filter = {
        startTime: time.getMonthStartAndEnd(date)[0],
        endTime: time.getMonthStartAndEnd(date)[1],
      };

      if (type !== 'all') {
        filter.cashStatus = [type];
      }

      Object.assign(param, {
        filter,
      });

      const cashInfoRes = await readWalletCash({
        params: param,
      });

      if (cashInfoRes.code === 0) {
        setWalletInfoPageData(cashInfoRes.data, this.cashDetail, {
          type,
          date: time.formatDate(date, 'YYYY-MM'),
          page,
        });

        return cashInfoRes.data;
      }

      throw {
        Code: cashInfoRes.code,
        Msg: cashInfoRes.Msg,
      };
    }

    // 发起提现
    @action
    createWalletCash = async ({ money, receiveAccount }) => {
      const res = await createWalletCash({
        data: {
          cashApplyAmount: money,
          receiveAccount,
        },
      });

      if (res.code === 0) {
        return res.data;
      }

      throw {
        Code: res.code,
        Msg: res.msg,
      };
    }

    // 充值
    @action
    rechargeMoney = async (amount) => {
      if (!isNaN(Number(amount))) {
        const params = {
          amount: Number(amount),
          title: '自动充值',
        };
        const { success, msg } = await rechargePay(params);
        console.log('充值result', success, msg);

        if (success) {
          return {
            success: true,
            msg: '充值成功',
          };
        }

        return {
          success: false,
          msg: msg || '充值失败',
        };
      }
    }
}

export default WalletAction;
