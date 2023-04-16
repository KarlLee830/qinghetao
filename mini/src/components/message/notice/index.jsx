import React from 'react';
import NoticeItem from '@components/message/notice-item';
import SliderScroll from '@components/slider-scroll';

const Index = (props) => (<SliderScroll RenderItem={NoticeItem} {...props} />)

export default Index;
