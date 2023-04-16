import {readWalletLog} from '@discuzqsdk/sdk/dist/api/wallet/read-walletlog';

export default async function _readWalletLog(opts, ctx = null) {
  const res = await readWalletLog({ ...opts, __context: ctx });
  return res;
}