import {readGoodsAnalysis} from '@discuzqsdk/sdk/dist/api/content/read-goodsanalysis';

/**
 * 获取商品信息
 */
export default async function _readProcutAnalysis(opt = {}) {
  const res = await readGoodsAnalysis({ ...opt });
  return res;
}
