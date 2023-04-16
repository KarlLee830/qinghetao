import React, { Component } from 'react';
import { inject, observer } from 'mobx-react';
import { Button, Input, Toast, Spin } from '@discuzqsdk/design';
import Header from '@components/header';
import Router from '@discuzqsdk/sdk/dist/router';
import styles from './index.module.scss';

@inject('user')
@observer
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isSubmit: false,
    };
  }

  initState = () => {
    this.setState({
      isSubmit: false,
    });
  };

  handleChangeNewUserName = (e) => {
    this.props.user.editUserName = e.target.value;
  };

  handleSubmit = async () => {
    try {
      this.setState({
        isSubmit: true,
      });
      await this.props.user.updateUsername();
      Toast.success({
        content: '修改用户名成功',
        duration: 2000,
      });
      setTimeout(() => {
        Router.back();
        this.initState();
      }, 1000);
    } catch (err) {
      console.error(err);
      if (err.Code) {
        Toast.error({
          content: err.Msg || '修改用户名失败',
          duration: 2000,
        });
        this.initState();
      }
    }
  };

  render() {
    const { user } = this.props;
    const { editUserName } = user;
    const { isSubmit } = this.state;
    return (
      <div id={styles.resetUserName}>
        <Header />
        <div className={styles.content}>
          <h3>设置新用户名</h3>
          <div className={styles.labelInfo}>
            <div className={styles.labelValue}>
              <Input
                value={editUserName}
                onChange={this.handleChangeNewUserName}
                placeholder="请输入新用户名"
                maxLength={30}
                trim
              />
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <Button
            disabled={!editUserName || isSubmit}
            full
            onClick={this.handleSubmit}
            type={'primary'}
            className={styles.btn}
          >
            {isSubmit ? <Spin type="spinner">提交中...</Spin> : '提交'}
          </Button>
        </div>
      </div>
    );
  }
}
