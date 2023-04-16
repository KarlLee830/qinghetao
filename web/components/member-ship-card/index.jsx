import React, { useState, useEffect } from 'react';
import styles from './index.module.scss';
import { Button, Dialog, Tabs } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import time from '@discuzqsdk/sdk/dist/time';
import { payGroupLevelStyle as levelStyle } from '@common/constants/const';
import groupPay from '@common/pay-bussiness/group-pay';
import classnames from 'classnames';
import Header from '@components/header';

const MemberShipCard = ({ site, user, onRenewalFeeClick, shipCardClassName,
  showRenderCard = true, visible = false, onClose = () => { }, groupLevel, router }) => {
  const { siteMode, isPC } = site;
  const { userInfo, paid, isAdmini, isIndefiniteDuration, expiredDays, expiredAt, payGroups } = user;
  const { group } = userInfo;
  const { level, remainDays, expirationTime, groupName, description, isTop, hasPayGroup, amount, groupId, typeTime, remainTime } = group;
  const theme = levelStyle[level] || {};
  const isPaySite = siteMode === 'pay';
  const [dialogVisible, setDialogVisible] = useState(visible);
  const [defaultActive, setDefaultActive] = useState(1);

  // 获取付费用户组数据
  useEffect(async () => {
    user.queryPayGroups();
  }, []);

  useEffect(() => {
    if (visible) setDialogVisible(visible);
  }, [visible]);

  useEffect(() => {
    setDefaultActive(groupLevel); // 如果是点击用户组徽章的情况
  }, [groupLevel]);

  // PC-打开升级付费用户组的弹窗，H5-跳转付费用户组购买页面
  const handlePayGroupRenewal = (upgradeLevel) => {
    if (!isPC) {
      router && router.push(`/my/upgrade`);
      return;
    }
    setDefaultActive(upgradeLevel);
    setDialogVisible(true);
  };

  // 处理付费站点续费
  const handleRenewalFee = () => {
    typeof onRenewalFeeClick === 'function' && onRenewalFeeClick();
  };

  // 执行付费
  const doPay = async ({ amount, groupId, title }) => {
    setDialogVisible(false);
    try {
      await groupPay({ amount, groupId, title, user, site });
    } catch (error) {}
  };

  // 获取日期格式
  const getDateFormat = () => {
    if (time.isCurrentYear(expiredAt)) {
      return 'MM月DD日';
    } else {
      return 'YYYY年MM月DD日';
    }
  };

  const renderFeeDateContent = () => {
    const typeMap = {
      0: '天',
      1: '时',
      2: '分',
    };
    // 付费用户组用户
    if (level > 0) {
      return (
        <>
          <div className={styles.feeDayContainer}>
            <span className={styles.feeDay} style={{color: theme.otherColor}}>{remainTime}</span>
            <span style={{color: theme.desAndDateColor}}>{typeMap[typeTime]}</span>
          </div>
          <span style={{color: theme.desAndDateColor}}>{time.formatDate(expirationTime, getDateFormat())}到期</span>
        </>
      );
    }

    // 付费站点用户
    if (isPaySite && paid) {
      if (expiredDays === 0) {
        return (
          <>
            <span className={styles.feeDay}>0</span>天
          </>
        );
      } else if (isIndefiniteDuration) {
        return <span className={styles.noTimeDate}>无限期</span>;
      } else {
        return (
          <>
            <div className={styles.feeDayContainer}>
              <span className={styles.feeDay}>{expiredDays}</span>天
            </div>
            <span style={{color: theme.desAndDateColor}}>{time.formatDate(expiredAt, getDateFormat())}到期</span>
          </>
        );
      }
    }
  };

  const renderButton = () => {
    const leftBtnStyle = {
      backgroundColor: theme.otherColor,
      borderColor: theme.otherColor,
      color: theme.leftBtnTextColor,
    };
    const rightBtnStyle = {
      marginLeft: '8px',
      backgroundColor: theme.rightBtnBgColor,
      borderColor: theme.otherColor,
      color: theme.otherColor,
    };

    // 付费用户组用户
    if (level > 0) {
      return (
        <>
          <Button onClick={() => doPay({amount, title: '付费用户组续费', groupId })} type="primary" className={styles.btn} style={leftBtnStyle}>续费</Button>
          {!isTop && <Button onClick={() => {handlePayGroupRenewal(level + 1)}} type="primary" className={styles.btn} style={rightBtnStyle}>升级</Button>}
        </>
      );
    }

    const upgrade = (<Button onClick={() => {handlePayGroupRenewal(level + 1)}} type="primary" className={styles.btn}>升级</Button>);

    // 付费站点用户
    if (isPaySite && paid && !isIndefiniteDuration) {
      return (
        <>
          <Button onClick={handleRenewalFee} type="primary" className={styles.btn} style={{marginRight: '12px'}}>续费</Button>
          {hasPayGroup && upgrade}
        </>
      );
    }

    // 普通用户且后台设置了付费用户组
    if (hasPayGroup) {
      return upgrade;
    }
  };

  const renderCard = (data, noBtn = false) => {
    const { groupName, level, description } = data;
    const theme = levelStyle[level] || {};
    return (
      <div className={classnames(`${styles.memberShipCardWrapper} ${shipCardClassName}`, { [styles.memberShipNoMargin]: noBtn && isPC })} style={{backgroundImage: `url(${theme.bgImg})`}}>
        <div className={styles.MemberShipCardContent}>
          <div className={styles.roleType} style={{color: theme.groupNameColor}}>{groupName}</div>
          <div className={styles.tagline} style={{color: theme.desAndDateColor}}>{level > 0 ? description : '访问海量站点内容'}</div>
          <div className={styles.RenewalFee} style={{visibility: noBtn ? 'hidden' : 'visible'}}>
            {renderButton()}
            <div className={styles.feeTimer}>{renderFeeDateContent()}</div>
          </div>
        </div>
      </div>
    );
  };

  return isAdmini ? null : (
    <div className={styles.wrapper} onClick={ e => e.stopPropagation() }>

      {/* 用户中心会员卡入口卡片 H5/PC */}
      {showRenderCard && renderCard({groupName, level, description})}

      {/* 付费用户组弹层 PC。H5使用单独页面 */}
      {dialogVisible && (
        <Dialog
          className={isPC ? styles.dialogWrapper : styles.mobileDialogWrapper}
          visible={true}
          maskClosable={true}
          onClose={() => {
            onClose();
            setDialogVisible(false);
          }}
        >
          {isPC ? null : <Header allowJump={false} customJum={() => {
            onClose();
            setDialogVisible(false);
          }} />}
          <Tabs activeId={defaultActive} onActive={activeId => setDefaultActive(activeId)}>
            {payGroups.map(({ name: groupName, level, description, fee, notice, amount, groupId, days }) => {
              const data = {
                groupName,
                level,
                description,
              };
              return (
                <Tabs.TabPanel key={level} id={level} label={groupName}>
                  <div className={styles.tabPanelContent}>
                    <div className={classnames(styles.tabPanel, {
                      [styles.mobileTabPanel]: !isPC
                    })}>
                      {renderCard(data, true)}
                      <div className={classnames(styles.operation, {
                        [styles.mobileOperation]: !isPC
                      })}>
                        <div className={styles.top}>
                          <div className={classnames({
                            [styles.upgradePrice]: isPC,
                            [styles.mobileUpgradePrice]: !isPC,
                          })}>
                            <span className={styles.symbol}>￥</span>
                            <span className={styles.price}>{fee}</span>
                          </div>
                          <div className={styles.time}>有效期：{`${days}天`}</div>
                        </div>

                        <Button className={styles.upgradeBtn} style={{margin: isPC ? '' : 0, visibility: level > group.level ? 'visible' : 'hidden'}} onClick={() => doPay({amount, title: groupName, groupId })}>立即升级</Button>
                      </div>
                    </div>

                    <div className={styles.tips} style={{padding: isPC ? '' : '16px'}}>
                      <div className={styles.title}>购买须知</div>
                      <div className={styles.text}>{notice}</div>
                    </div>
                  </div>
                </Tabs.TabPanel>
              );
            })}
          </Tabs>
        </Dialog>
      )}

    </div>
  );

};

export default inject('site', 'user')(observer(MemberShipCard));