import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';

import Avatar from '@components/avatar';

import styles from './index.module.scss';

import { Icon, Button } from '@discuzqsdk/design';
@inject('site')
@inject('user')
@observer
class WalletInfo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  moneyFormat = (freezeAmount, availableAmount) => {
    return (parseFloat(freezeAmount) + parseFloat(availableAmount)).toFixed(2);
  }

  operateWallet = (type) => {
    this.props.operateWallet(type);
  }

  render() {
    const isShowRecharge = this.props.isShowRecharge;
    const { site } = this.props;
    return (
        <div className={`${this.props.webPageType === 'h5' ? styles.containerH5 : styles.containerPC}`}>
            {
                this.props.webPageType === 'PC'
                  ? <div className={styles.header}>
                    <Avatar
                      wrapClassName={styles.avatarWrap}
                      className={styles.avatar}
                      image={this.props.user?.avatarUrl}
                      name={this.props.user?.nickname}
                      circle={true}
                      size={'large'}>
                    </Avatar>
                    <div className={styles.name}><span title={this.props.user?.nickname}>{this.props.user?.nickname}</span></div>
                </div> : ''
            }
			
            <div className={`${this.props.webPageType === 'h5' ? styles.totalAmountH5 : styles.totalAmountPC}`}>
                <div className={styles.moneyTitle}>当前总金额</div>
                {
                  this.props.walletData?.freezeAmount && this.props.walletData?.availableAmount
                    ? <div className={styles.moneyNum}>
                    {this.moneyFormat(this.props.walletData?.freezeAmount,this.props.walletData?.availableAmount)}
                  </div> : <div className={styles.moneyNum}></div>
                }
            </div>
			{ site.webConfig.setSite.siteWithdrawal[0].value && (
			  <div className={`${this.props.webPageType === 'h5' ? styles.amountStatusH5 : styles.amountStatusPC}`}>
			      <div className={styles.frozenAmount} onClick={this.props.onFrozenAmountClick}>
			          <div className={styles.statusTitleFreeze}>
			              <span>冻结金额</span>
			              <div className={styles.statusNum}>{this.props.walletData?.freezeAmount}</div>
			          </div>
			          <div className={styles.frozenIcon}>
			            {
			              this.props.webPageType === 'PC' ? <Icon name={'RightOutlined'} size={12} className={styles.icon}></Icon> : ''
			            }
			          </div>
			      </div>
			      <div className={styles.withdrawalAmount}>
			          <div className={styles.statusTitle}>可提现金额</div>
			          <div className={styles.statusNum}>{this.props.walletData?.availableAmount}</div>
			      </div>
			  </div>
			)}
            
			  
			{
				this.props.webPageType === 'PC'
				  ? <div className={styles.footer}>
					  <div className={styles.buttonBox}>
					        { site.webConfig.setSite.siteWithdrawal[0].value && (
							    <Button type={'text'} className={styles.button} onClick={() => this.operateWallet('withdrawal')}>提现</Button>
							)}
							    {isShowRecharge && <Button type={'text'} className={styles.button} onClick={() => this.operateWallet('recharge')}>充值</Button>}
			
					  </div>
					</div> : ''
			}
			
			
            
        </div>
    );
  }
}

export default withRouter(WalletInfo);
