import { observable, computed } from 'mobx';
import { get } from '../../utils/get';
class WalletStore {
    /**
     * 钱包tab类型  (fix: 解决H5钱包路由跳转无法保持组件状态)
     * income - 收入 pay -支出 withdrawal - 提现
    */
    @observable tabsType = 'income'

    // 钱包明细
    @observable walletInfo = {}

    // 收入明细
    @observable incomeDetail = {}

    // 支出明细
    @observable expandDetail = {}

    // 冻结明细
    @observable freezeDetail = {}

    // 提现明细
    @observable cashDetail = {}

    // 用户钱包可用余额
    @computed get walletAvaAmount() {
        return get(this.walletInfo, 'availableAmount');
    }

}

export default WalletStore;
