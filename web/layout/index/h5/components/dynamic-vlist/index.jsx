import React from 'react';
import VList from '@components/virtual-list/h5/index';
import ThreadContent from '@components/thread';

export default class DynamicVList extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        const { children, pageData, sticks, onScroll, loadNextPage, noMore, requestError, errorText, platform } = this.props;
        return (
            <VList
              showTabBar
              list={pageData}
              sticks={sticks}
              onScroll={onScroll}
              loadNextPage={loadNextPage}
              noMore={noMore}
              requestError={requestError}
              errorText={errorText}
              platform={platform}
              renderItem={(item, index, recomputeRowHeights, onContentHeightChange, measure) => (
                <ThreadContent
                  onContentHeightChange={measure}
                  onImageReady={measure}
                  onVideoReady={measure}
                  key={`${item.threadId}-${item.updatedAt}`}
                  // showBottomStyle={index !== pageData.length - 1}
                  data={item}
                  recomputeRowHeights={measure}
                />
              )}
            >
              {children}
            </VList>
        );
    }
}