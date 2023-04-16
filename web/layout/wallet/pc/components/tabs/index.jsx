import React, { Component } from 'react';
import { Icon } from '@discuzqsdk/design';
import styles from './index.module.scss';
import classNames from 'classnames';
export default class index extends Component {

  constructor(props) {
    super(props)
    this.state = {
      optionsList: [
        {
          title: "收入明细",
          icon: "TicklerOutlined",
          type: "income",
          iconColor: "#3ac15f",
        },
        {
          title: "支出明细",
          icon: "WallOutlined",
          type: "pay",
          iconColor: "#FFC300",
        },
        {
          title: "提现记录",
          icon: "TransferOutOutlined",
          type: "withdrawal",
          iconColor: "#e02433",
        },
      ]
    }
  }

  handleTriggerSelectedTypes = (type) => {
    this.props.handleTriggerSelectedTypes && this.props.handleTriggerSelectedTypes(type)
  }

  render() {
    const { optionsList = [] } = this.state;
    const { activeType, className = '' } = this.props;
    return (
      <div className={`${styles.container} ${className}`}>
        {
          optionsList.map((item, index) => {

            return (
              <div className={styles.detailed} onClick={() => { this.handleTriggerSelectedTypes(item.type) }}>
                <div className={styles.left}>
                  <div
                    className={classNames(styles.circle,{
                      [styles.selectedCircle]: activeType === item.type
                    })}
                  >
                    <div
                      className={classNames(styles.spot,{
                        [styles.selectedSpot]: activeType === item.type
                      })}
                    ></div>
                  </div>
                  {
                    index === 0 && (
                      <div className={styles.linePosition}>
                        <div className={styles.line}></div>
                      </div>
                    )
                  }
                </div>
                <div className={styles.rigth}>
                  <Icon name={item.icon} size='14' color={activeType === item.type ? '#2469F6' : item.iconColor}></Icon>
                  <span
                    className={classNames(styles.text,{
                      [styles.textColor]: activeType === item.type
                    })}
                  >{item.title}</span>
                </div>
              </div>
            )
          })
        }
      </div>
    )
  }
}
