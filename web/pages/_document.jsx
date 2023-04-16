import React from 'react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import envConfig from '@common/config';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  createTalkingdata() {
    const currEnvConfig = envConfig();

    if (process.env.NODE_ENV === 'development') {
      return '';
    }
    return `
      setTimeout(function() {
        var appid = '';
        var channelname = window.location.hostname;
        if (!!window.navigator.userAgent.match(/AppleWebKit.*Mobile.*/)) {
          appid = '500D36509CE649E88446FB4E7A51B221'; // h5
        } else {
          appid = '4F323A1D5F444BF69C7C4E10704AEA2F'; // pc
        }
        var url = 'http://sdk.talkingdata.com/app/h5/v1?appid=' + appid + '&vn=' + '${currEnvConfig.version}' + '&vc=' + '${currEnvConfig.version}' + '&td_channelid=' + channelname;
        if ( window.location.protocol.indexOf('https') != -1 ) {
          url = 'https://jic.talkingdata.com/app/h5/v1?appid=' + appid + '&vn=' + '${currEnvConfig.version}' + '&vc=' + '${currEnvConfig.version}' + '&td_channelid=' + channelname;
        }
        var talkingdata = document.createElement('script');
        talkingdata.type = 'text/javascript';
        talkingdata.async = true;
        talkingdata.src = url;
        document.getElementsByTagName('body')[0].appendChild(talkingdata);


        window.sessionStorage.setItem('__TD_td_channel', window.location.hostname.replace(/\./g, '_'));
        var tdjs = document.createElement('script');
        tdjs.type = 'text/javascript';
        tdjs.async = true;
        tdjs.src = 'https://jic.talkingdata.com/app/h5/v1?appid=750AEE91CF4446A19A2D12D5EE32F725';
        document.getElementsByTagName('body')[0].appendChild(tdjs);

        var dzqjs = document.createElement('script');
        dzqjs.type = 'text/javascript';
        dzqjs.async = true;
        dzqjs.src = '../dzq.js';
        document.getElementsByTagName('body')[0].appendChild(dzqjs);
      }, 2000);
    `;
  }
  // dzqjs.src = 'https://dl.discuz.chat/dzq.js';

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="screen-orientation" content="portrait"/>
          <meta name="x5-orientation" content="portrait"/>
          <script dangerouslySetInnerHTML={{ __html: `
              setTimeout(function() {
                function remCalc (){
                  var a = 375;
                  if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                    a=document.documentElement.clientWidth||document.body.clientWidth;
                    if(a>750){a=750}else{if(a<320){a=320}}
                  }
                  document.documentElement.style.fontSize=(a/7.5)*2+"px";
                };
                remCalc();
                window.addEventListener('resize', remCalc);
              }, 0);
          ` }} />
        </Head>


        <body>
            <Main />
            <script dangerouslySetInnerHTML={{ __html: `
                var userAgent = navigator.userAgent; //取得浏览器的userAgent字符串
                var isIE = userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1; //判断是否IE<11浏览器
                var isIE11 = userAgent.indexOf('Trident') > -1 && userAgent.indexOf("rv:11.0") > -1;
                if(isIE || isIE11) {
                  document.body.innerHTML = '<style>html,body{width: 100%;height: 100%;display: block;}h1{padding: 20px;}h3{padding: 15px;}.box{text-align: center;margin-top: 40vh;}</style><div class="box"><h1>站点不支持IE浏览器！</h1><h3>请使用QQ浏览器、chrome，Edge等浏览器。</h3></div>';
                }
            ` }}>

            </script>
            <NextScript/>
        </body>
        <script dangerouslySetInnerHTML={{ __html: this.createTalkingdata() }}/>
        <script dangerouslySetInnerHTML={{ __html: `
            // 微信设置字体最大，布局乱的补丁
            function is_weixn() {
              var ua = navigator.userAgent.toLowerCase();
              return ua.match(/MicroMessenger/i) == "micromessenger";
            }
            if (is_weixn()) {
              if (
                typeof WeixinJSBridge == "object" &&
                typeof WeixinJSBridge.invoke == "function"
              ) {
                handleFontSize();
              } else {
                if (document.addEventListener) {
                  document.addEventListener("WeixinJSBridgeReady", handleFontSize, false);
                } else if (document.attachEvent) {
                  document.attachEvent("WeixinJSBridgeReady", handleFontSize);
                  document.attachEvent("onWeixinJSBridgeReady", handleFontSize);
                }
              }
              function handleFontSize() {
                // 设置网页字体为默认大小
                WeixinJSBridge.invoke("setFontSizeCallback", { fontSize: 0 });
                // 重写设置网页字体大小的事件
                WeixinJSBridge.on("menu:setfont", function () {
                  WeixinJSBridge.invoke("setFontSizeCallback", { fontSize: 0 });
                });
              }
            }
        ` }}/>

        <script dangerouslySetInnerHTML={{ __html: `
            setTimeout(function() {
              // 腾讯地图定位组件
              var geolocation = document.createElement('script');
              geolocation.type = 'text/javascript';
              geolocation.async = true;
              geolocation.src = "https://mapapi.qq.com/web/mapComponents/geoLocation/v/geolocation.min.js";
              document.getElementsByTagName('body')[0].appendChild(geolocation);

              // 腾讯云cos文件预览sdk
              var cosDocumentPreviewSDK = document.createElement('script');
              cosDocumentPreviewSDK.type = 'text/javascript';
              cosDocumentPreviewSDK.async = true;
              cosDocumentPreviewSDK.src = "https://cloudcache.tencentcs.com/operation/dianshi/other/cos-document-preview-sdk-v0.1.1.9128e51973a36da64dfb242554132ab7f86a5125.js";
              document.getElementsByTagName('body')[0].appendChild(cosDocumentPreviewSDK);

            }, 500)
        ` }}/>
      </Html>
    );
  }
}

export default MyDocument;
