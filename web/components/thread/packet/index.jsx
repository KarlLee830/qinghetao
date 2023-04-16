import React, { useMemo } from 'react';
import styles from './index.module.scss';

/**
 * 帖子红包、悬赏视图
 * @prop {string}  type 判断是红包还是悬赏
 * @prop {string}  condition 判断是集赞领红包还是评论领红包
 */
const Index = ({ money = 0, remainMoney = 0, number, remainNumber, type = 0, onClick, condition = 0 }) => {
  const title = useMemo(() => {
    if (type === 0) {
      return condition === 0 ? '回复领红包' : '集赞领红包';
    }
    return '评论领赏金';
  }, [type]);

  const url = useMemo(() => (type === 0 ? '/dzq-img/red-packet.png' : '/dzq-img/reward-question.png'), [type]);

  // 格式化金额，保留两位小数，且去除小数点后面的0
  const formatMoney = useMemo(() => {
    const num = Number(money);
    if (!num) {
      return money;
    }

    const newNum = num.toFixed(2);
    const regexp = /(?:\.0*|(\.\d+?)0+)$/;
    return newNum.replace(regexp, '$1');
  }, [money]);

  return (
    // <div className={styles.container} onClick={onClick}>
    //   <div className={styles.wrapper}>
    //     <img className={styles.img} src={url} />
    //     <span className={styles.title}>{title}</span>
    //     <span className={styles.money}>￥{formatMoney}</span>
    //   </div>
    // </div>
    <div className={styles.root} onClick={onClick}>
      {
        type === 0 ? (
          <div className={styles.hongbao_box}>
            <div className={styles.hongbao}>
              <div className={styles.left}>
                <div className={styles.top}> {condition === 0 ? '回复领红包' : '集赞领红包'}</div>
                {
                  number && number * 1 > 0 && (<div className={styles.bottom}>
                    已领取{(number - remainNumber).toFixed(0)}个红包，剩余{remainNumber}个红包
                  </div>)
                }
              </div>
              <div className={styles.right}><div className={styles.pie}><img alt="图片" src='/dzq-img/redpacket-mini.png'></img></div></div>
            </div>
          </div>
        ) : (
          <div className={styles.xuanshang_box}>
            <div className={styles.xuanshang}>
              <div className={styles.left}>
                {
                  money ? (
                    <div>
                      <div className={styles.remain}>剩余{remainMoney}元</div>
                      <div className={styles.cur}>已发放{(money - remainMoney).toFixed(2)}元</div>
                    </div>
                  ) : (
                    <div className={styles.mid}>评论领赏金</div>
                  )
                }
              </div>
              <div className={styles.right}><div className={styles.shang}>赏</div></div>
            </div>
          </div>
        )
      }
    </div>
  );
};

export default React.memo(Index);

