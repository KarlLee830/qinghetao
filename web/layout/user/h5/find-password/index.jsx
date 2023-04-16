import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Button, Input } from '@discuzqsdk/design';
import layout from './index.module.scss';
import HomeHeader from '@components/home-header';
import PhoneInput from '@components/login/phone-input';


@inject('site')
@inject('user')
@inject('thread')
@inject('userRegister')
@observer
class FindPasswordH5Page extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
    };
  }
  render() {
    const { username } = this.state;
    return (
      <div className={layout.container}>
        <HomeHeader hideInfo mode='login'/>
        <div className={layout.content}>
          <div className={layout.title}>找回密码</div>
          <Input
            className={layout.input}
            value={username}
            placeholder="用户名"
            onChange={(val) => {
              this.setState({ username: val });
            }}
          />
          <PhoneInput/>
          <Button className={layout.button} type="primary">
            下一步
          </Button>
        </div>
      </div>
    );
  }
}

export default withRouter(FindPasswordH5Page);
