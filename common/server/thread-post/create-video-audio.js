import { createThreadVideoAudio } from '@discuzqsdk/sdk/dist/api/content/create-video-audio';

/**
 * 创建视频音频接口
 * @param {object} params 请求参数
 * @param {string} params.fileId 要上传的文件
 * @param {number} params.type 要上传的类型，[不必须】视频：0，音频：1
 * @param {string} params.fileName 排序情况【不必须】
 */
export default async function _createThreadVideoAudio(params) {
  const res = await createThreadVideoAudio({
    data: params,
  });
  return res;
}
