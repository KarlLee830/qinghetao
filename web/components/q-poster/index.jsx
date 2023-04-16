import React from 'react';
import { inject, observer } from 'mobx-react';
import PCQPoster from './pc';
import H5QPoster from './h5';

@inject('site')
@observer
class QPoster extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { site } = this.props;
    const { platform } = site;
	if (platform === 'pc') {
	  return <PCQPoster {...this.props} />;
	}
	return <H5QPoster {...this.props} />;
  }
}

export default QPoster;
