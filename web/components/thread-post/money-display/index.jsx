import React from 'react';
import styles from './index.module.scss';
import { Tag } from '@discuzqsdk/design';
import { THREAD_TYPE } from '@common/constants/thread-post';
import { defaultOperation, paidOption } from '@common/constants/const';
import { plus } from '@common/utils/calculate';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';

function MoneyDisplay(props) {
  const {
    canEditRedpacket,
    canEditReward,
    postData = {},
    onAttachClick = () => { },
    onDefaultClick = () => {},
    payTotalMoney,
    redTotalMoney,
  } = props;
  const clsName = props.pc ? styles.pc : styles.h5;

  const tags = (
    <>
      {/* 付费 */}
      {!!(postData.price || postData.attachmentPrice) && (
        <Tag
          closeable
          onClose={() => props.setPostData({ price: 0, attachmentPrice: 0 })}
          onClick={() => {
            const curPaySelect = postData.price ? paidOption[0].name : paidOption[1].name;
            props.handleSetState({ curPaySelect });
          }}
        >付费总额{payTotalMoney}元</Tag>
      )}
      {/* 红包 */}
      {postData.redpacket.price && (
        <Tag closeable={canEditRedpacket}
          onClose={() => {
            onDefaultClick({
              id: defaultOperation.redpacket,
              type: THREAD_TYPE.redPacket,
            }, {}, { redpacket: {} });
          }}
          onClick={() => {
            onDefaultClick({
              id: defaultOperation.redpacket,
              type: THREAD_TYPE.redPacket,
            }, {});
          }}
        >
          {postData.redpacket.rule === 1 ? '随机红包' : '定额红包'}
          \总金额{redTotalMoney}元\{postData.redpacket.number}个
          {postData.redpacket.condition === 1 && `\\集赞个数${postData.redpacket.likenum}`}
        </Tag>
      )}
      {/* 悬赏问答内容标识 */}
      {(postData.rewardQa.value && postData.rewardQa.times) && (
        <Tag closeable={canEditReward}
          onClose={() => onAttachClick({ type: THREAD_TYPE.reward }, { rewardQa: {} })}
          onClick={() => {
            onAttachClick({ type: THREAD_TYPE.reward });
          }}
        >
          {`悬赏金额${plus(postData.rewardQa.value, 0)}元\\结束时间 ${postData.rewardQa.times}`}
        </Tag>
      )}
    </>
  );

  if (props.pc) return tags;
  return (
    <div id="dzq-money-box" className={`${styles['money-box']} ${clsName}`} onClick={e => e.stopPropagation()}>
      {tags}
    </div>
  );
}

export default inject('threadPost')(observer(withRouter(MoneyDisplay)));
