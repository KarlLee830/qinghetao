import React from 'react';
import { inject, observer } from 'mobx-react';
import H5TrendingTopics from './h5';
import PCTrendingTopics from './pc';

@inject('site')
@observer
class TrendingTopics extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { site } = this.props;
    const { platform } = site;

    if (platform === 'pc') {
      return <PCTrendingTopics {...this.props} />;
    }
    return <H5TrendingTopics {...this.props} />;
  }
}

export default TrendingTopics;