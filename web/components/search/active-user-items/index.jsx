import React from 'react';
import { inject, observer } from 'mobx-react';
import H5ActiveUserItems from './h5';
import PCActiveUserItems from './pc';

@inject('site')
@observer
class ActiveUserItems extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { site } = this.props;
    const { platform } = site;

    if (platform === 'pc') {
      return <PCActiveUserItems {...this.props} />;
    }
    return <H5ActiveUserItems {...this.props} />;
  }
}

export default ActiveUserItems;