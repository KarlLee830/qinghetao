import React from 'react';
import { inject, observer } from 'mobx-react';
import H5BaseLayout from './h5';
import PCBaseLayout from './pc';

@inject('site')
@observer
class BaseLayout extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { site } = this.props;
    const { platform } = site;

    if (platform === 'pc') {
      return <PCBaseLayout {...this.props} />;
    }
    return <H5BaseLayout {...this.props} />;
  }
}

export default BaseLayout;