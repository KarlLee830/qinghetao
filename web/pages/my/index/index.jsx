import React from 'react';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';
import Router from '@discuzqsdk/sdk/dist/router';
class MyReplace extends React.Component {
  componentDidMount() {
    Router.replace({url: '/my'})
  }

  render() {
    return null;
  }
}

export default HOCFetchSiteData(HOCWithLogin(MyReplace));
