import { action } from 'mobx';
import TopicStore from './store';
import { readTopicsList } from '../../server';
import typeofFn from '@common/utils/typeof';
import threadReducer from '../thread/reducer';

class TopicAction extends TopicStore {
  constructor(props) {
    super(props);
  }

  @action
  setTopics(data) {
    this.topics = data;
  }

  @action
  setTopicDetail(data) {
    this.topicDetail = data;

    const threads = [];
    data?.pageData?.map(item => {
      threads.push(...item?.threads);
    })
    this.topicThreads = {
      pageData: threads,
    };
  }

  /**
 * 话题 - 列表
 * @param {object} search * 搜索值
 * @returns {object} 处理结果
 */
  @action
  async getTopicsList({ search = '', sortBy = '1', perPage = 10, page = 1 } = {}) {
    const topicFilter = {
      sortBy,
      content: search,
      hot: 0
    };
    const result = await readTopicsList({ params: { filter: topicFilter, perPage, page } });

    if (result.code === 0 && result.data) {
      if (this.topics && result.data.pageData && page !== 1) {
        this.topics.pageData.push(...result.data.pageData);
        const newPageData = this.topics.pageData.slice();
        this.setTopics({ ...result.data, pageData: newPageData });
      } else {
        // 首次加载，先置空，是为了列表回到顶部
        this.setTopics({ pageData: [] });
        this.setTopics(result.data);
      }
      return result.data;
    }

    this.threadList.setListRequestError({ namespace: this.namespace, errorText: result?.msg || '' });

    return Promise.reject(result?.msg || '');
  };

  /**
 * 话题帖子 - 列表
 * @param {object} search * 搜索值
 * @returns {object} 处理结果
 */
  @action
  async getTopicsDetail({ topicId = '', perPage = 10, page = 1 } = {}) {
    const topicFilter = {
      topicId: Number(topicId),
      hot: '0'
    };
    const result = await readTopicsList({ params: { filter: topicFilter, perPage, page } });
    if (result.code === 0 && result.data) {
      if (this.topicDetail && result.data.pageData && page !== 1) {
        this.topicDetail.pageData.push(...result.data.pageData);
        const newPageData = this.topicDetail.pageData.slice();
        this.setTopicDetail({ ...result.data, pageData: newPageData });
      } else {
        this.setTopicDetail(result.data);
      }
      return result.data;
    }
    return null;
  };

    /**
     * 话题页面 - 清空缓存数据
     */
    @action
    resetTopicsData() {
      this.setTopics(null)
      this.setTopicDetail(null)
    }
}

export default TopicAction;
