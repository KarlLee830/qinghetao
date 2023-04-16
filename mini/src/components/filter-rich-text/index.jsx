import React, { useMemo } from 'react';
import RichText from '@discuzqsdk/design/dist/components/rich-text/index';
import s9e from '@common/utils/s9e';
import xss from '@common/utils/xss';

const FilterRichText = ({
  content = "",
  ...others
}) => {

  // 过滤内容
  const filterContent = useMemo(() => {
    let newContent = content ? s9e.parse(content) : '暂无内容';
    newContent = xss(newContent);
    return newContent;
  }, [content]);


  return <>
    <RichText
      content={filterContent}
      {...others}
    />
  </>;
};

export default FilterRichText;
