import React from 'react';
import styles from './index.module.scss';
import Header from '@components/header';
import { Toast } from '@discuzqsdk/design';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import { inject, observer } from 'mobx-react';

@inject('site')
@inject('user')
@observer
class PayPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      list: [],
      target: 0,
    };
    this.keyboardClickHander = this.keyboardClickHander.bind(this);
    this.renderPwdItem = this.renderPwdItem.bind(this);
  }

  componentDidMount() {}

  keyboardClickHander(e) {
    const key = e.target.getAttribute('data-key');
    if (key == null) {
      return null;
    }
    const { list } = this.state;

    if (key === '-1') {
      this.setState({
        list: list.slice(0, list.length - 1),
      });
    } else if (list.length < 6) {
      this.setState(
        {
          list: [].concat(list, [key]),
        },
        () => {
          if (this.state.list.length === 6) {
            this.submitPwa();
          }
        },
      );
    }
  }

  async submitPwa() {
    const { list } = this.state;
    const { router, user } = this.props;
    const { userInfo } = user;
    const { id } = userInfo;
    const { query } = router;
    const { token = '' } = query;
    ('');
    const data = {
      id,
      payPasswordToken: token,
      payPassword: list.join(''),
      payPasswordConfirmation: list.join(''),
    };

    const target = Toast.loading({
      content: '提交中...',
      duration: 0,
    });

    const result = await user.updateUserInfo(id);
    target.hide();
    if (result) {
      Toast.error({
        content: '更新用户信息错误！',
        duration: 1000,
      });
    }
    router.back();
  }

  renderPwdItem() {
    const { list } = this.state;
    const nodeList = list.map((item, key) => (
      <div className={`${styles.payListItem} ${styles.activation}`} key={key}>
        {item}
      </div>
    ));
    if (nodeList.length < 6) {
      let curr = false;
      for (let i = nodeList.length; i < 6; i++) {
        if (!curr) {
          curr = true;
          nodeList.push(<div className={`${styles.payListItem} ${styles.curr}`} key={i}></div>);
        } else {
          nodeList.push(<div className={styles.payListItem} key={i}></div>);
        }
      }
    }

    return nodeList;
  }

  render() {
    return (
      <div>
        <Header />
        <p className={styles.title}>输入支付密码</p>
        <div className={styles.payList}>{this.renderPwdItem()}</div>
        <div className={styles.keyboard} onClick={this.keyboardClickHander}>
          <div className={styles.line}>
            <div data-key="1" className={styles.column}>
              1
            </div>
            <div data-key="2" className={styles.column}>
              2
            </div>
            <div data-key="3" className={styles.column}>
              3
            </div>
          </div>
          <div className={styles.line}>
            <div data-key="4" className={styles.column}>
              4
            </div>
            <div data-key="5" className={styles.column}>
              5
            </div>
            <div data-key="6" className={styles.column}>
              6
            </div>
          </div>
          <div className={styles.line}>
            <div data-key="7" className={styles.column}>
              7
            </div>
            <div data-key="8" className={styles.column}>
              8
            </div>
            <div data-key="9" className={styles.column}>
              9
            </div>
          </div>
          <div className={styles.line}>
            <div className={`${styles.column} ${styles.special}`}></div>
            <div data-key="0" className={styles.column}>
              0
            </div>
            <div data-key="-1" className={`${styles.column} ${styles.special}`}>
              取消
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// eslint-disable-next-line new-cap
export default HOCFetchSiteData(PayPassword);
