import React from 'react';
import { inject, observer } from 'mobx-react';
import PCQosters from './pc';
import H5Qosters from './h5';

@inject('site')
@observer
class Qosters extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { site } = this.props;
    const { platform } = site;
	if (platform === 'pc') {
	  return <PCQosters {...this.props} />;
	}
	return <H5Qosters {...this.props} />;
  }
}

export default Qosters;
