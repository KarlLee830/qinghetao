import React from 'react';
import H5CommentList from './h5';
import PCCommentList from './pc';

export default function CommentList(props) {
  const { platform } = props;
  return platform === 'pc' ? <PCCommentList {...props}></PCCommentList> : <H5CommentList {...props}></H5CommentList>;
}
