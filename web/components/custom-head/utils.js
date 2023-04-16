
export const evalScript = (s) => {
    if (s.indexOf('<script') === -1) return s;
    const p = /<script[^\>]*?>([^\x00]*?)<\/script>/gi;
    let arr = [];
    while ((arr = p.exec(s))) {
      let p1 = /<script[^\>]*?src=\"([^\>]*?)\"[^\>]*?(reload=\"1\")?(?:charset=\"([\w\-]+?)\")?><\/script>/i;
      let arr1 = [];
      arr1 = p1.exec(arr[0]);
      if (arr1) {
        appendScript(arr1[1], '', arr1[2], arr1[3]);
      } else {
        p1 = /<script(.*?)>([^\x00]+?)<\/script>/i;
        arr1 = p1.exec(arr[0]);
        appendScript('', arr1[2], arr1[1].indexOf('reload=') !== -1);
      }
    }
    return s;
}
  
const appendScript = (src, text, reload, charset) => {
    const id = hash(src + text);
    const evalScripts = [];
    const JSLOADED = [];

    if (!reload && in_array(id, evalScripts)) return;

    if (reload && document.getElementById(id)) {
      document.getElementById(id).parentNode.removeChild(document.getElementById(id));
    }

    evalScripts.push(id);

    const scriptNode = document.createElement('script');
    scriptNode.type = 'text/javascript';
    scriptNode.id = id;
    try {
      if (src) {
        scriptNode.src = src;
        scriptNode.onloadDone = false;
        scriptNode.onload = () => {
          scriptNode.onloadDone = true;
          JSLOADED[src] = 1;
        };
        scriptNode.onreadystatechange = function() {
          if (
            (scriptNode.readyState === 'loaded' || scriptNode.readyState === 'complete')
            && !scriptNode.onloadDone
          ) {
            scriptNode.onloadDone = true;
            JSLOADED[src] = 1;
          }
        };
      } else if (text) {
        scriptNode.text = text;
      }
      document.getElementsByTagName('head')[0].appendChild(scriptNode);
    } catch (e) {
      console.log(e);
    }
}

const hash = (string, length = 32) => {
    let start = 0;
    let i = 0;
    let result = '';
    let fillLen = '';
    fillLen = length - (string.length % length);
    for (i = 0; i < fillLen; i += 1) {
        string += '0';
    }
    while (start < string.length) {
        result = stringXor(result, string.substr(start, length));
        start += length;
    }
    return result;
}

const stringXor = (s1, s2) => {
    let s = '';
    const hash = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const max = Math.max(s1.length, s2.length);
    for (let i = 0; i < max; i++) {
      const k = s1.charCodeAt(i) ^ s2.charCodeAt(i);
      s += hash.charAt(k % 52);
    }
    return s;
}
  
const in_array = (needle, haystack) => {
    if (typeof needle === 'string' || typeof needle === 'number') {
        for (const i in haystack) {
            if (haystack[i] === needle) {
                return true;
            }
        }
    }
    return false;
}