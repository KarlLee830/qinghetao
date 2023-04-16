import React from 'react';
import { View } from '@tarojs/components';
import Thread from '@components/thread';
import Taro from '@tarojs/taro';
import { inject, observer } from 'mobx-react';

@inject('index')
@inject('baselayout')
@observer
export default class List extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            displays: []
        }

        // 保存监听对象
        this.observerObjs = []
    }

    observePage = (pageIndex) => {
        const { windowHeight } = this.props
        if (!windowHeight) {
          return
        }

        const that = this

        const observerObj = Taro.createIntersectionObserver().relativeToViewport({ top: 3 * windowHeight, bottom: 3 * windowHeight });
        observerObj.observe(`#virtual-list-${pageIndex}`, (res) => {
            // 视频全屏判断
            const { baselayout } = that.props
            if (baselayout.videoFullScreenStatus === "inFullScreen") {
                return
            }

            const isHidden = res.intersectionRatio <= 0

            const { displays } = that.state
            if (!displays[pageIndex] || `${displays[pageIndex]}` !== `${!isHidden}`) {
                const newDisplays = displays.slice()
                newDisplays[pageIndex] = !isHidden

                that.setState({
                    displays: newDisplays
                })
            }

        });

        if (this.observerObjs && this.observerObjs[pageIndex]) {
            const observer = this.observerObjs[pageIndex]
            observer?.disconnect()
        }

        this.observerObjs[pageIndex] = observerObj
    }

    componentWillUnmount() {
        this.observerObjs.forEach(observer => {
            observer?.disconnect()
        })

        this.observerObjs = []
        this.setState({ displays: [] })
    }

    render () {
        const { dataSource, dispatch } = this.props
        const { displays } = this.state
        return (
            <>
                {
                    dataSource?.map((item, index) => {
                        return (
                        <View id={`virtual-list-${index}`}>
                        {
                            item?.map((subItem, subIndex) => (<Thread enableCommentList={true} data={subItem} setData={this.props.setData} setVisible={this.props.setVisible} key={`${subItem.threadId}-${subItem.updatedAt}-${subItem._time || ''}`} relativeToViewport={displays[index]} dispatch={dispatch}/>))
                        }
                        </View>
                    )})
                }
            </>
        )
    }
}
