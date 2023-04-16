const typeMap = {
  101: 'IMAGE',
  102: 'VOICE',
  103: 'VIDEO',
  104: 'GOODS',
  105: 'QA',
  106: 'RED_PACKET',
  107: 'REWARD',
  108: 'VOTE',
  109: 'VOTE_THREAD',
  110: 'FILE',
  111: 'QA_IMAGE',
  10002: 'IFRAME',
};

export function parseContentData(indexes) {
  const parseContent = { plugin: {} };
  if (indexes && Object.keys(indexes)) {
    Object.entries(indexes).forEach(([, value]) => {
      if (value) {
        const { tomId, body, _plugin = {} } = value;
        if ( typeMap[tomId] ) {
          parseContent[typeMap[tomId]] = body;
        } else {
          // const { _plugin } = body;
          if ( _plugin ) {
            parseContent.plugin[_plugin?.name] = {
              tomId,
              body,
              _plugin,
            };
          }
        }
      }
    });
  }
  return parseContent;
}
