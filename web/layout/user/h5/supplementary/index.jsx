import React from 'react';
import { inject, observer } from 'mobx-react';
import { withRouter } from 'next/router';
import { Button, Toast } from '@discuzqsdk/design';
import h5layout from './index.module.scss';
import pclayout from './pc.module.scss';
import { getSignInFields, setSignInFields } from '@server';
import PcBodyWrap from '../components/pc-body-wrap';
import HomeHeader from '@components/home-header';
import Header from '@components/header';
import { toJS, set, observable, action } from 'mobx';
import { InputType, CreateFunctions } from './components';
import LoginHelper from '@common/utils/login-helper';

@inject('site')
@inject('user')
@inject('thread')
@inject('supplementary')
@inject('commonLogin')
@observer
class SupplementaryH5Page extends React.Component {
  async componentDidMount() {
    try {
      this.target = Toast.loading({
        hasMask: true,
        duration: 0,
      });
      const res = await getSignInFields();
      this.target.hide();
      this.props.supplementary.fields = res.data;
      this.props.supplementary.values = this.props.supplementary.fields?.map((field) => {
        let defaultValue;
        switch (field.type) {
          case InputType.RADIO_GROUP:
          case InputType.FILE:
          case InputType.PHOTO:
            defaultValue = [];
            break;
          default:
            defaultValue = '';
        }
        return ({ ...field, value: defaultValue });
      });
    } catch (e) {
      Toast.error({
        content: e,
        duration: 2000,
      });
    }
  }

  createComponent(field) {
    const { site } = this.props;
    const { platform } = site;
    const layout = platform === 'h5' ? h5layout : pclayout;
    const f = CreateFunctions[field.type];
    if (!f) return (<></>);
    return f(field, layout, site);
  }


  processData =() => {
    const { fields, values = [] } = this.props.supplementary;
    return values?.map((v, index) => {
      if (v.required === 1) {
        if (v.value.length === 0
          || (v.value.trim && v.value.trim().length === 0)) {
          throw new Error(`${v.name}未填写`);
        }
      }

      let fieldsExt; let options;
      if (v.value.length) {
        switch (v.type) {
          case InputType.INPUT:
          case InputType.TEXTAREA:
            fieldsExt = v.value?.trim();
            break;
          case InputType.FILE:
          case InputType.PHOTO:
            fieldsExt = v.value.map((file) => {
              const { url, id, uuid, name } = file;
              return { url, id, uuid, name };
            });
            break;
          case InputType.RADIO_GROUP:
            ({ options } = JSON.parse(v.fieldsExt));
            fieldsExt = { options: options.map((option) => {
              option.checked = option.value === v.value;
              return option;
            }) };
            break;
          case InputType.CHECKBOX_GROUP:
            const valueSet = new Set(v.value);
            ({ options } = JSON.parse(v.fieldsExt));
            fieldsExt = { options: options.map((option) => {
              option.checked = valueSet.has(option.value);
              return option;
            }) };
            break;
        }
      }
      fieldsExt = JSON.stringify(fieldsExt);
      return { ...fields[index], fieldsExt };
    });
  };
  render() {
    const { values } = this.props.supplementary;
    const { site } = this.props;
    const { platform } = site;
    const layout = platform === 'h5' ? h5layout : pclayout;
    return (
      <PcBodyWrap>
        <div className={layout.container}>
          {
            platform === 'h5'
              ? <HomeHeader hideInfo mode='login'/>
              : <>
                  <Header/>
                  <div className={layout.title}>填写补充信息</div>
                </>
          }
          <div className={layout.content}>
            {values?.map(field => this.createComponent(field))}
            <Button className={layout.button} type='primary' onClick={ () => {
              try {
                const data = this.processData(values);
                setSignInFields({ data: { data } })
                  .then(async () => {
                    Toast.success({
                      content: '提交成功',
                      duration: 1000,

                    });
                    const id = this.props.user?.id;
                    await this.props.user.updateUserInfo(id);
                    const { statusCode, statusMsg, needToBindPhone,
                      needToBindWechat, nickName, sessionToken } = this.props.commonLogin;

                    if (needToBindPhone) {
                      return this.props.router.push(`/user/bind-phone?sessionToken=${sessionToken}`);
                    }

                    if (needToBindWechat === true) {
                      return this.props.router.push(`/user/wx-bind-qrcode?sessionToken=${sessionToken}&loginType=${platform}&nickname=${nickName}&isSkip=${true}`);
                    }
                    if (statusMsg && statusCode) {
                      return this.props.router.push(`/user/status?statusCode=${statusCode}&statusMsg=${statusMsg}`);
                    }
                    LoginHelper.restore();
                  });
              } catch (e) {
                // todo 优化错误处理
                Toast.error({
                  content: e.message || e,
                  duration: 2000,
                });
              }
            }}>
              确定
            </Button>
          </div>
        </div>
      </PcBodyWrap>
    );
  }
}

export default withRouter(SupplementaryH5Page);
