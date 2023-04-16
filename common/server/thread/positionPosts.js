import { positionPosts } from '@discuzqsdk/sdk/dist/api/thread/position-posts';

export default async function _positionPosts(opts = {}) {
  return await positionPosts(opts);
}
