import React from 'react';
import TrendingTopic from '@layout/search/pc/components/trending-topics'
import SidebarPanel from '@components/sidebar-panel';
import { withRouter } from 'next/router';
import { inject, observer } from 'mobx-react';

@inject('search')
@observer
class Index extends React.Component {
  constructor(props) {
    super(props);
  }

  state = {
    topics: null,
    isError: false,
    errorText: '加载失败'
  }

  componentDidMount() {
    this.loadData()
  }

  onTopicClick = ({ topicId } = {}) => {
    this.props.router.push(`/topic/topic-detail/${topicId}`);
  }

  loadData = async () => {
    const hasTopics = !!this.props.search.topics;
    if(hasTopics) {
      this.setState({
        topics: this.props.search.topics,
      });
      return;
    }
    try {
      const res = await this.props.search.getTopicsList();
      if (res) {
        this.setState({
          topics: res,
        });
      }
    } catch (error) {
      this.setState({
        isError: true,
        errorText: error
      });
    }
  }

  redirectToSearchResultTopic = () => {
    this.props.router.push('/search/result-topic');
  };

  render () {
    const { pageData } = this.state.topics || {};
    const { topicsError } = this.props.search || {};
    const { isError, errorText } = this.state

    return (
      <SidebarPanel
        title="潮流话题"
        isLoading={!pageData}
        noData={!pageData?.length}
        onShowMore={this.redirectToSearchResultTopic}
        isError={topicsError.isError || isError}
        errorText={topicsError.errorText || errorText}
      >
          <TrendingTopic className="pop-topic" data={pageData?.filter((_, index) => index < 8)} onItemClick={this.onTopicClick}/>
      </SidebarPanel>
    );
  }
};

export default withRouter(Index);
