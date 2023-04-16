export function urlToLink(str) {
  // 匹配 https|http|ftp|rtsp|mms 协议以及非空格和中文以外的任意字符
  const urlReg = /(((https|http|ftp|rtsp|mms)?:\/\/)[^\s\u4e00-\u9fa5/<>]+\.[^)，,。；、？\s\u4e00-\u9fa5<>]+)/ig;
  // 匹配 code，没有在正则里面带上 code 标签，是因为 code 标签有可能存在不确定的 class 类，不容易匹配，
  // 因此分开处理。而且 code 有两种存在形式：<pre><code></code></pre> 和 < code ></code >
  const preReg = /(<pre[^>]*><code[^>]*>)([^<]*)<\/code><\/pre>/ig;
  const codeReg = /(<code[^>]*>)([^<]*)<\/code>/ig;
  // 匹配 a
  const aReg = /<a[\s]*[^<>]*href="([\S]*[^\s<>'"]*)"/ig;
  // 匹配 img
  const imgReg = /<img[\s]*[^<>]*src="([\S]*[^\s<>"']*)"/ig;
  // 匹配iframe
  const iframeReg = /<iframe[\s]*[^<>]*([\S]*[^\s<>"']*)="([\S]*[^\s<>"']*)"/ig;

  try {
    str = str
      .replace(preReg, (p, p1, p2) => `${p1}${encodeURIComponent(p2)}</code></pre>`)
      .replace(codeReg, (p, p1, p2) => `${p1}${encodeURIComponent(p2)}</code>`)
      .replace(imgReg, (p, p1) => `<img alt="${encodeURIComponent(p1)}" src="${encodeURIComponent(p1)}"`)
      .replace(iframeReg, p => `${encodeURIComponent(p)}`)
      .replace(aReg, (p, p1) => `<a href="${encodeURIComponent(p1)}"`)
      .replace(urlReg, website => `<a href="${encodeURIComponent(website)}" rel="nofollow noopener noreferrer" target="_blank">${website}</a>`)
      .replace(preReg, (p, p1, p2) => `${p1}${decodeURIComponent(p2)}</code></pre>`)
      .replace(codeReg, (p, p1, p2) => `${p1}${decodeURIComponent(p2)}</code>`)
      .replace(/%3Ciframe[^>]*>[^<]*<\/iframe>/ig, p => `${decodeURIComponent(p)}`)
      .replace(imgReg, p => `${decodeURIComponent(p)}`)
      .replace(aReg, p => `${decodeURIComponent(p)}`);
  } catch (error) {
    console.error(error);
  }
  return str;
}
