import React from 'react';
import styles from './index.module.scss';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import HOCWithLogin from '@middleware/HOCWithLogin';
import Header from '@components/header';


class MyNotice extends React.Component {
  render() {
    return (
      <div className='index'>
        <Header/>
        <h1>敬请期待</h1>
      </div>
    );
  }
}

export default HOCFetchSiteData(HOCWithLogin(MyNotice));
