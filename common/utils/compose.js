import typeofFn from '@common/utils/typeof';

export default async function compose(fns, ctx) {
  if (!typeofFn.isArray(fns)) return null;
  let result = {};
  for (let i = 0; i < fns.length; i++) {
    result = await fns[i](ctx, result);
  }
  return result;
}
