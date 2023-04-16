/**
 * 判断是否是服务器端
 */
export default function isServer() {
  return typeof window === 'undefined';
}
