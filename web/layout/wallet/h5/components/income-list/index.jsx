import React from 'react';
import { observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { time } from '@discuzqsdk/sdk/dist/index';
import { diffDate } from '@common/utils/diff-date';
import styles from './index.module.scss';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';
import RichText from '@discuzqsdk/design/dist/components/rich-text/index';


@observer
class IncomeList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  filterTag(html) {
    return html?.replace(/<(\/)?([beprt]|br|div)[^>]*>|[\r\n]/gi, '')
      .replace(/<img[^>]+>/gi, $1 => {
        return $1.includes('qq-emotion') ? $1 : "[图片]";
      });
  }

  // parse content
  parseHTML = (content) => {
    let t = xss(s9e.parse(this.filterTag(content)));
    t = (typeof t === 'string') ? t : '';
    return t;
  }

  render() {
    const { key, itemKey, dataLength } = this.props
    return (
        <div className={styles.container} key={key}>
            <div className={styles.content}>
                <div className={styles.text}>
                    {
                        this.props.incomeVal.type === 0 ? <span className={styles.name}>{'打赏用户名'} </span> : ''
                    }
                    {/* <span>{this.props.incomeVal.title || this.props.incomeVal.changeDesc}</span> */}
                    <RichText content={this.parseHTML(this.props.incomeVal.title || this.props.incomeVal.changeDesc)} />
                </div>
                <div className={styles.money}>+{this.props.incomeVal.amount}</div>
            </div>
            {/* // FIXME:这里的结构有问题 怪怪的 所以只能用数组长度取消底部边框线 */}
            <div className={styles.time} style={{borderBottom: itemKey === dataLength - 1 && 0}}>{time.formatDate(this.props.incomeVal.createdAt, 'YYYY-MM-DD HH:mm')}</div>
        </div>
    );
  }
}

export default withRouter(IncomeList);
