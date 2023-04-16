import React from 'react';
import PhoneInputPC from './pc';
import PhoneInputH5 from './h5';
import { inject } from 'mobx-react';

@inject('site')
class PhoneInput extends React.Component {
  render() {
    const { site } = this.props;
    const { platform } = site;
    return platform === 'h5' ? <PhoneInputH5 {...this.props} /> : <PhoneInputPC {...this.props}/>;
  }
}

// eslint-disable-next-line new-cap
export default PhoneInput;
