import React, { useState, useEffect } from 'react';
import { Radio, Button, Input, Toast, Icon } from '@discuzqsdk/design';
import { inject, observer } from 'mobx-react';
import styles from './index.module.scss';
import DDialog from '@components/dialog';
import DatePicker, { registerLocale } from 'react-datepicker';
import { zhCN } from 'date-fns/locale';
import DatePickers from '@components/thread/date-picker';
import { formatDate } from '@common/utils/format-date';

registerLocale('zh-CN', zhCN);
const Index = ({ cancel, pc, visible, threadPost }) => {
  const data = JSON.parse(JSON.stringify(threadPost.postData));
  const initSubitems = [{
    id: 0,
    content: '',
  }, {
    id: 0,
    content: '',
  }];

  const hasVoteData = data?.vote?.voteTitle;
  const voteId = data?.vote?.voteId || '';

  const [subitems, setSubitems] = useState(hasVoteData ? data.vote.subitems : initSubitems);
  const [title, setTitle] = useState(hasVoteData ? data.vote.voteTitle : '');
  const [type, setType] = useState(hasVoteData ? data.vote.choiceType : 1);
  const [time, setTime] = useState(hasVoteData ? data.vote.expiredAt : formatDate(new Date(new Date().getTime() + 60 * 60 * 1000), 'yyyy/MM/dd hh:mm'));
  const [show, setShow] = useState(false);


  const vote = () => {
    let subitemsCopy = [...subitems];
    subitemsCopy = subitemsCopy.filter(item => !!item.content);

    if (!title) {
      Toast.info({ content: '标题不能为空' });
      return;
    }

    if (subitemsCopy.length < 2) {
      Toast.info({ content: '至少需要提供两个有效选项' });
      return;
    }

    if (new Date(time) < new Date()) {
      Toast.info({ content: '投票结束时间必须大于当前时间' });
      return;
    }


    setSubitems(subitemsCopy);
    threadPost.setPostData({
      vote: {
        voteId,
        voteTitle: title,
        choiceType: type,
        expiredAt: formatDate(new Date(time), 'yyyy/MM/dd hh:mm:ss'),
        subitems: subitemsCopy,
      },
    });
    cancel();
  };

  const content = (
    <div className={styles['vote-editor']} onClick={e => e.stopPropagation()} style={ pc ? {} : { overflow: 'auto', paddingBottom: '59px' }}>

      <div className={styles['line-box']} style={{ justifyContent: 'unset' }}>
        <div className={styles.label}>标题</div>
        <div className={styles.item} style={{ marginLeft: '16px' }}>
          <Input autoFocus="true" mode="text" placeholder="标题最多支持25个字" value={title} onChange={e => setTitle(e.target.value.trim().substr(0, 25))} />
        </div>
      </div>

      <div className={styles['line-box']}>
        <div className={styles.label}>
          <span>投票选项</span>
          <span className={styles.tips}>最多支持20个字</span>
        </div>
      </div>

      {subitems.map((item, index) => (
        <div className={styles['line-box']} key={index} style={{ justifyContent: 'unset', position: 'relative' }}>
          <div className={styles.label}>{`${index + 1}.`}</div>
          <div className={styles.item} style={{ marginLeft: '16px' }}>
            <Input mode="text" value={item.content} onChange={(e) => {
              const arr = [...subitems];
              arr[index].content = e.target.value.trim().substr(0, 20);
              setSubitems(arr);
            }} />
          </div>
          {/* 删除选项按钮 */}
          <Icon
              style={{ visibility: subitems.length > 2 ? 'visible' : 'hidden' }}
              name="DeleteOutlined"
              className={styles['delete-icon']}
              onClick={(e) => {
                const arr = [...subitems];
                arr.splice(index, 1);
                setSubitems(arr);
              }}
            />
        </div>
      ))}

      <div className={`${styles['line-box']} ${styles['add-btn']}`}>
        <Button
          style={{ visibility: subitems.length < 20 ? 'visible' : 'hidden' }}
          onClick={() => {
            const arr = [...subitems];
            arr.push({
              id: 0,
              content: '',
            });
            setSubitems(arr);
          }}>
          <Icon name="PlusOutlined" size={10} />
          <span>添加选项</span>
        </Button>
      </div>

      <div className={styles['line-box']}>
        <div className={styles.label}>投票方式</div>
        <div className={styles.item}>
          <Radio.Group
            value={type}
            onChange={(item) => {
              setType(item);
            }}
          >
            <Radio name={1}> 单选 </Radio>
            <Radio name={2}> 多选 </Radio>
          </Radio.Group>
        </div>
      </div>

      <div className={styles['line-box']}>
        <div className={styles.label}>结束时间</div>
        <div className={`${styles.item} ${styles.times}`}>
          {pc ? (
            <>
              <DatePicker
                selected={new Date(time)}
                minDate={new Date()}
                onChange={date => setTime(formatDate(date, 'yyyy/MM/dd hh:mm'))}
                showTimeSelect
                dateFormat="yyyy/MM/dd HH:mm:ss"
                locale="zh-CN"
              />
              <Icon name="RightOutlined" />
            </>
          ) : (
            <>
              <div onClick={() => setShow(true)}>{time}</div>
              <Icon name="RightOutlined" />
            </>
          )}
        </div>
      </div>
      {pc ? '' : (
        <>
          <DatePickers
            time={new Date(time)}
            onSelects={(e) => {
              setTime(e);
              setShow(false);
            }}
            isOpen={show}
            onCancels={() => setShow(false)}
          />
          <div className={styles.btn} style={{ position: pc ? 'absolute' : 'fixed' }}>
            <Button onClick={() => cancel()}>取消</Button>
            <Button type="primary" onClick={() => {}}>确定</Button>
          </div>
        </>
      )}


      {/* 按钮 */}
      {!pc && (
        <div className={styles.btn} style={{ position: pc ? 'absolute' : 'fixed' }}>
          <Button onClick={() => {
            cancel();
          }}>
            取消
          </Button>
          <Button type="primary" onClick={vote}>
            发起投票
          </Button>
        </div>
      )}
    </div>
  );

  if (!pc) return content;

  return (
    <DDialog
      maskClosable={false}
      visible={visible}
      className={styles.pc}
      onClose={cancel}
      title={hasVoteData ? '编辑投票' : '创建投票'}
      onCacel={cancel}
      onConfirm={vote}
      confirmText="发起投票"
    >
      {content}
    </DDialog>
  );
};

export default inject('threadPost')(observer(Index));
