/**
 * 添加红包表单
 * @prop {visible} boolean 切换红包弹框显示性
 * @prop {data} object 输入红包数据
 * @prop {cancle} object 取消事件
 * @prop {confirm} object 确认事件，输出红包对象
 */
import React, { memo, useState, useEffect } from 'react'; // 性能优化的
import { Radio, Button, Input, Toast } from '@discuzqsdk/design'; // 原来就有的封装
import styles from './index.module.scss'; // 私有样式
import DDialog from '@components/dialog';
import PropTypes from 'prop-types'; // 类型拦截

const Index = ({ data, confirm, cancel, pc, visible }) => {
  const [rule, setRule] = useState(1); // 0-定额 1-随机
  const [condition, setCondition] = useState(0); // 0-回复 1-集赞
  const [price, setPrice] = useState(''); // 金额
  const [number, setNumber] = useState(''); // 红包个数
  const [likenum, setLikenum] = useState(''); // 集赞数

  const handleClose = () => {
    cancel();
  };
  useEffect(() => {
    if (data !== undefined && Object.keys(data).length > 0) {
      setRule(data.rule);
      setCondition(data.condition);
      setPrice(data.price);
      setNumber(data.number);
      setLikenum(data.likenum);
    }
  }, []);

  const onPriceChang = (val) => { // 对红包金额做仅可输入两位小数的操作
    const arr = val.match(/([1-9]\d{0,2}|0)(\.\d{0,2})?/);
    setPrice(arr ? arr[0] : '')
  }

  const onNumberChang = (val) => {
    const arr = val.match(/[1-9]\d{0,2}/);
    setNumber(arr ? arr[0] : '')
  }

  const onLikenumChang = (val) => {
    const arr = val.match(/[1-9]\d{0,2}/);
    setLikenum(arr ? arr[0] : '')
  }
  // 校验红包数据
  const checkConfirm = () => {
    if (!price) {
      Toast.warning({ content: '请输入红包金额', duration: 2000 });
      return false;
    }

    if (parseFloat(price) < 0.1 || parseFloat(price) > 200) {
      Toast.warning({ content: '可输入红包金额为0.1 ~ 200元', duration: 2000 });
      return false;
    }

    if (!number) {
      Toast.warning({ content: '请输入红包个数', duration: 2000 });
      return false;
    }

    if (parseInt(number) > 100 || parseInt(number) < 1) {
      Toast.warning({ content: '可输入红包个数为1 ~ 100个', duration: 2000 });
      return false;
    }

    if (rule === 1 && parseInt(number) * 0.01 > parseFloat(price)) {
      Toast.warning({ content: '当前随机模式下红包金额、数量不匹配', duration: 2000 });
      return false;
    }

    if (condition === 1 && !likenum) {
      Toast.warning({ content: '请输入点赞数', duration: 2000 });
      return false;
    }

    if (condition === 1 && parseInt(likenum) > 250) {
      Toast.warning({ content: '可输入点赞数为1 ~ 250个', duration: 2000 });
      return false;
    }

    return true;
  }

  const handleConfirm = () => { // 确认选择
    // 1 校验数据
    if (!checkConfirm()) return;

    // 2 准备更新store
    confirm({
      rule,
      price: parseFloat(price),
      number: parseInt(number),
      condition,
      likenum: parseInt(likenum),
    });

    // 3 关闭弹框
    handleClose();
  };

  const content = (
    <div className={styles['redpacket-box']} onClick={e => e.stopPropagation()}>
      {/* 发放规则 */}
      <div className={styles['line-box']}>
        <div className={styles.label}>发放规则</div>
        <div className={styles.item}>
          <Radio.Group
            value={rule}
            onChange={(val) => {
              setRule(val);
            }}
          >
            <Radio name={1}> 随机 </Radio> <Radio name={0}> 定额 </Radio>
          </Radio.Group>
        </div>
      </div>
      {/* 红包总金额 */}
      <div className={styles['line-box']}>
        <div className={styles.label}>{rule === 1 ? '红包总金额' : '红包单个金额'}</div>
        <div className={styles.item}>
          <Input mode="number" placeholder="金额" value={price} onChange={e => onPriceChang(e.target.value)} />元
        </div>
      </div>
      {/* 红包个数 */}
      <div className={styles['line-box']}>
        <div className={styles.label}>红包个数</div>
        <div className={styles.item}>
          <Input mode="number" value={number} placeholder="个数" onChange={e => onNumberChang(e.target.value)} />个
        </div>
      </div>
      {/* 获利条件 */}
      <div className={styles['line-box']}>
        <div className={styles.label}>获利条件</div>
        <div className={styles.item}>
          <Radio.Group
            value={condition}
            onChange={(item) => {
              setCondition(item);
            }}
          >
            <Radio name={0}> 回复领红包 </Radio> <Radio name={1}> 集赞领红包 </Radio>
          </Radio.Group>
        </div>
      </div>
      {/* 集赞数 */}
      {condition === 1 && (
        <div className={styles.likenum}>
          <div className={styles['likenum-input']}>
            <Input mode="number" htmlType="number" placeholder="个数" value={likenum} onChange={e => onLikenumChang(e.target.value)} />个
          </div>
        </div>
      )}
      {/* 按钮 */}
      {!pc && (
        <div className={styles.btn}>
          <Button onClick={() => {
            handleClose();
          }}>
            取消
          </Button>
          <Button type="primary" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      )}
    </div>
  );

  if (!pc) return content;

  return (
    <DDialog
      visible={visible}
      className={styles.pc}
      onClose={handleClose}
      title="添加红包"
      onCacel={handleClose}
      onConfirm={handleConfirm}
    >
      {content}
    </DDialog>
  );
};
// 设置props默认类型
Index.propTypes = {
  visible: PropTypes.bool.isRequired, // 限定visible的类型为bool,且是必传的
  confirm: PropTypes.func.isRequired, // 限定confirm的类型为functon,且是必传的
};

// 设置props默认参数
Index.defaultProps = {
  visible: false,
  data: {},
  confirm: () => { },
  cancel: () => { },
};

export default memo(Index);
