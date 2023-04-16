import React, { useCallback }  from 'react';
import UserCenterEditFindPayPwd from '../../../../../components/user-center-edit-paypwd/find/paypwd/index';
import Page from '@components/page';
import Taro from '@tarojs/taro';

export default function index() {
  const [ticket, setTicket] = React.useState('');
  const [randstr, setRandStr] = React.useState('');

  const handleCaptchaResult = useCallback((result) => {
    setTicket(result.ticket);
    setRandStr(result.randstr);
  }, []);

  const handleCloseChaReault = useCallback(() => {
    setTicket('');
    setRandStr('');
  }, []);

  const clearCaptchaData = useCallback(() => {
    setTicket('');
    setRandStr('');
  }, []);

  React.useEffect(() => {
    Taro.eventCenter.on('captchaResult', handleCaptchaResult);
    Taro.eventCenter.on('closeChaReault', handleCloseChaReault);

    return () => {
      Taro.eventCenter.off('captchaResult', handleCaptchaResult);
      Taro.eventCenter.off('closeChaReault', handleCloseChaReault);
    };
  }, []);
  
  return (
    <Page>
      <UserCenterEditFindPayPwd  ticket={ticket} randstr={randstr} clearCaptchaData={clearCaptchaData}/>
    </Page>
  )
}
