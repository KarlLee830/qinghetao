import React from 'react';
import { inject, observer } from 'mobx-react';
import classNames from 'classnames';
import styles from './index.module.scss';

import SliderScroll from '@components/slider-scroll';
import ThreadCenterView from '@components/thread/ThreadCenterView';

@inject('index')
@inject('user')
@inject('thread')
@observer
class Index extends React.Component {
  // 渲染单项草稿组件
  renderItem = ({ item, onEdit, isLast }) => (
      <div className={classNames(styles.item, { [styles['border-none']]: isLast })}>
        <ThreadCenterView 
          data={item} 
          user={this.props.user} 
          onClick={() => onEdit(item)} 
          updateThread={this.props.thread.updateThread.bind(this.props.thread)}
          updateListThreadIndexes={this.props.index.updateListThreadIndexes.bind(this.props.index)}
        />
        <div className={styles['item-time']} onClick={() => onEdit(item)}>
          编辑于&nbsp;{item.updatedAt}
        </div>
      </div>
  )

  getRenderList = (data = []) => data.map(item => ({ id: item.threadId, ...item }))

  render() {
    const { index, dispatch, onDelete, onEdit } = this.props;
    const { currentPage, totalPage, totalCount, pageData } = index?.drafts || {};
    const topCard = (<div className={styles.header}>{totalCount || 0}&nbsp;条草稿</div>);
    return (
      <div className={styles.wrapper}>
        <SliderScroll
          showHeader={true}
          topCard={topCard}
          list={this.getRenderList(pageData)}
          RenderItem={this.renderItem}
          noMore={currentPage >= totalPage}
          onPullDown={() => dispatch(false)}
          onScrollBottom={() => dispatch(true)}
          onBtnClick={onDelete}
          onEdit={onEdit}
          showLoadingInCenter={false}
        />
      </div>
    );
  }
}

export default Index;
