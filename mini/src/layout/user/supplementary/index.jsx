import React from 'react';
import { inject, observer } from 'mobx-react';
import Button from '@discuzqsdk/design/dist/components/button/index';
import Toast from '@discuzqsdk/design/dist/components/toast/index';
import { View } from '@tarojs/components';
import layout from './index.module.scss';
import { getSignInFields, setSignInFields } from '@server';
// import PcBodyWrap from '../components/pc-body-wrap';
import HomeHeader from '@components/home-header';
import { InputType, CreateFunctions } from './components';
import Router from '@discuzqsdk/sdk/dist/router';
import LoginHelper from '@common/utils/login-helper';

@inject('site')
@inject('user')
@inject('thread')
@inject('supplementary')
@observer
class SupplementaryH5Page extends React.Component {
  async componentDidMount() {
    try {
      const res = await getSignInFields();
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
        return { ...field, value: defaultValue };
      });
    } catch (e) {
      Toast.error({
        content: e,
        duration: 2000,
      });
    }
  }

  createComponent(field) {
    const f = CreateFunctions[field.type];
    if (!f) return <></>;
    return f(field, layout);
  }

  processData = () => {
    const { fields, values } = this.props.supplementary;
    return values.map((v, index) => {
      if (v.required === 1) {
        if (v.value.length === 0
          || (v.value.trim && v.value.trim().length === 0)) {
          throw new Error(`${v.name}未填写`);
        }
      }

      let fieldsExt;
      let options;
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
            fieldsExt = {
              options: options.map((option) => {
                option.checked = option.value === v.value;
                return option;
              }),
            };
            break;
          case InputType.CHECKBOX_GROUP:
            const valueSet = new Set(v.value);
            ({ options } = JSON.parse(v.fieldsExt));
            fieldsExt = {
              options: options.map((option) => {
                option.checked = valueSet.has(option.value);
                return option;
              }),
            };
            break;
        }
      }
      fieldsExt = JSON.stringify(fieldsExt);
      return { ...fields[index], fieldsExt };
    });
  };

  submit() {
    try {
      const { values } = this.props.supplementary;
      const data = this.processData(values);

      setSignInFields({ data: { data } }).then(() => {
        Toast.success({
          content: '提交成功',
          duration: 2000,
        });
        setTimeout(() => {
          LoginHelper.restore();
        }, 1000);
      });
    } catch (e) {
      // todo 优化错误处理
      console.log(e);
      Toast.error({
        content: e.message || e,
        duration: 2000,
      });
    }
  }

  render() {
    const { values } = this.props.supplementary;

    return (
      <View className={layout.container}>
        <HomeHeader hideInfo hideMinibar mode="supplementary"/>
        <View className={layout.content}>
          {values?.map((field) => this.createComponent(field))}
          <Button type="primary" className={layout.button} onClick={() => this.submit()}>
            确定
          </Button>
        </View>
      </View>
    );
  }
}

export default SupplementaryH5Page;
