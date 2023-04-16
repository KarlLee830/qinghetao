

import { getWXConfig } from '@discuzqsdk/sdk/dist/api/wx/get-wx-config';
import browser from '@common/utils/browser';
const DEFAULT_JSAPULIST = ['closeWindow', 'chooseImage', 'uploadImage', 'getLocalImgData', 'updateAppMessageShareData', 'updateTimelineShareData', 'getNetworkType'];

let isInited = false;

export default async function initWXSDK(isInitConfig = false, jsApiList = []) {
    if ( !browser.env('weixin') ) return;
    const allPromise = [];

    if (!(window.wx && wx.config)) {
        const scriptPromise = new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://res.wx.qq.com/open/js/jweixin-1.6.0.js';
            script.onload = () => resolve();
            document.body.appendChild(script);
        });
        allPromise.push(scriptPromise);
    }

    await Promise.all(allPromise);

    if (!isInitConfig || isInited) return;
    const res = await getWXConfig({params: {
        url: encodeURIComponent(window.location.href)
    }});
    if ( res.code === 0 && res.data && res.data.appId) {
        const params = (({ appId, timestamp, nonceStr, signature }) => ({ appId, timestamp, nonceStr, signature }))(res.data);
        // params.signature = '用来测试签名失效的场景';
        wx && wx.config({
            debug: false,
            ...params,
            jsApiList: [...DEFAULT_JSAPULIST, ...jsApiList],
        });
        if (wx) {
            wx.hasDoneConfig = true;
        }
        isInited = true;
        return true;
    } else {
        console.error('初始化微信jssdk失败！', res);
    }
    return false;
}