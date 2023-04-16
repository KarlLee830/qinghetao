import { readThreadPoster } from '@discuzqsdk/sdk/dist/api/home/read-thread-poster';

/** 海报列表
 * @param {object} params
 * @returns object
 */
export default async function _readThreadPoster(opts, ctx = null) {
  // 2021-07-28 后台接口字段调整，将scope替换sequence
  if (opts?.params) {
    const keys = Object.keys(opts.params)
    if (keys.indexOf('sequence') !== -1) {
      opts.params.scope = opts.params.sequence

      delete opts.params.sequence;
    }
  }
  const res = await readThreadPoster({ ...opts, __context: ctx, isValidate: false });
  return res;
}

