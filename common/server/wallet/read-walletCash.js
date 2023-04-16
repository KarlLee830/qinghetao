import {readWalletCash} from '@discuzqsdk/sdk/dist/api/wallet/read-walletcash';
export default async function _readWalletCash(opts, ctx = null) {
  const res = await readWalletCash({ ...opts, __context: ctx });
  return res;
}