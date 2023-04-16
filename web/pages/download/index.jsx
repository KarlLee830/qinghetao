import React from 'react';
import { inject, observer } from 'mobx-react';
import { Toast } from '@discuzqsdk/design';
import isWeiXin from '@common/utils/is-weixin';
import Router from '@discuzqsdk/sdk/dist/router';
import { readDownloadAttachment } from '@server';
import goToLoginPage from '@common/utils/go-to-login-page';
import HOCFetchSiteData from '@middleware/HOCFetchSiteData';
import { readThreadDetail } from '@server';
import { parseContentData } from '@layout/thread/utils';


@inject('user')
@observer
class Download extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async componentDidMount() {
    const { url } = this.props.router.query;
    if (!url) return;

    // 获取附件的下载链接，url中链接不全，从asPath中获取
    const { asPath } = this.props.router;
    const urlArr = decodeURI(asPath).split('?');
    const urlstr = `${urlArr[1].split('=')[1]}?${urlArr[2].split('&')[0]}&${urlArr[2].split('&')[1]}`;
    const paramArr = urlArr[2].split('&');
    const sign = paramArr[0].split('=')[1];
    const threadId = paramArr[2].split('=')[1];
    const attachmentsId = Number(paramArr[1].split('=')[1]);

    const { canDownloadAttachment, attachment } = await this.getCanDownloadAttachment(threadId);
    if (!canDownloadAttachment) {
      Toast.warning({ content: '暂⽆权限下载附件' });
      Router.redirect({ url: '/' });
      return;
    }
    const attachmentUrl = this.getAttachmentLink(attachmentsId, attachment);
    const params = {
      sign: sign,
      attachmentsId: attachmentsId,
      threadId: threadId,
    }
    // 获取链接状态，先判断链接是否可以下载文件
    const isDownload = await this.downloadAttachment(params);
    if (isDownload) {
      Toast.info({ content: '正在下载' });
      window.location.href = attachmentUrl;
    }
  }

  // 获取帖子详情，判断是否有权限下载
  async getCanDownloadAttachment(id) {
    const res = await readThreadDetail({ params: { threadId: Number(id) } });
    if (res.code === 0) {
      const parseContent = parseContentData(res?.data?.content?.indexes);
      return {
        canDownloadAttachment: res?.data?.ability?.canDownloadAttachment,
        attachment: parseContent && parseContent.VOTE
      }
    }
  }

  // 获取附件地址链接
  getAttachmentLink(id, data) {
    for (let i = 0; i < data?.length; i++) {
      if (data[i].id === id) return data[i].url;
    }
  }

  // 获取链接状态
  async downloadAttachment(params) {
    const res = await readDownloadAttachment(params);

    if (res?.code === 0) {
      // 弹出下载弹框
      Router.redirect({ url: '/' });
      return true;
    }

    if (res?.code === -7083) {  // 超过今天可下载附件的最大次数
      Toast.info({ content: res?.msg });
      Router.redirect({ url: '/' });
    }

    if (res?.code === -7082) {  // 下载资源已失效
      Toast.info({ content: res?.msg });
      Router.redirect({ url: '/' });
    }

    if (res?.code === -4004) {  // 资源不存在
      Toast.info({ content: res?.msg });
    }
    
    if (res?.code === -5001) { // 操作太快，请稍后再试
      Toast.info({ content: res?.msg });
      Router.redirect({ url: '/' });
    }
    return false;
  }
  
  render() {
    return <div></div>;
  }
}
export default HOCFetchSiteData(Download);