import { readPluginList } from '@discuzqsdk/sdk/dist/api/plugin/read-plugin-list';
export default async function _readPluginListConfig(opts = {}, ctx = null) {
  const res = await readPluginList({ url: '/api/v3/plugin/list', ...opts, __context: ctx });
  return res;
}
