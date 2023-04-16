import {readFollow} from '@discuzqsdk/sdk/dist/api/user/read-follow';;
import set from '../../utils/set';
import deepClone from '../../utils/deep-clone';

export default async function _getUserFans(opts, ctx) {
  const options = deepClone(opts);
  set(options, 'params.filter.type', 2);
  const res = await readFollow({ ...options, __context: ctx });
  return res;
}
