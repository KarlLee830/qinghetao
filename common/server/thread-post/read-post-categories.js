import { readPostCategories } from '@discuzqsdk/sdk/dist/api/content/read-post-categories';

export default async function _readPostCategories(opt = {}) {
  const res = await readPostCategories({ ...opt });
  return res;
};
