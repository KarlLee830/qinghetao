import Card from '@components/card'
import React from 'react'
import Taro, { getCurrentInstance, EventChannel } from '@tarojs/taro';
import { inject, observer } from 'mobx-react';
import {getMiniCode, readWechatPosterGenqrcode} from '@server'
import setUrlParam from '@common/utils/set-url-param';
import defaultLogo from '../../public/dzq-img/default-logo.png'

@inject('index')
@inject('user')
@inject('site')
@observer
class Index extends React.Component {
    constructor(props) {
        super(props)
        Taro.eventCenter.once('message:detail', (data) => this.data = data)
        Taro.eventCenter.once('message:comment', (data) => this.commentData = data)
        Taro.eventCenter.once('message:invite', (data) => this.inviteData = data)
        Taro.eventCenter.once('message:experience', (data) => this.experienceData = data)
        Taro.eventCenter.trigger('page:init')
        this.state = {
            miniCode: null
        }
    }
    async componentDidMount(){
        const threadId = this.data?.threadId;
        const commentId = this.commentData?.id;
        const invitePath = this.inviteData?.path;
        const inviteCode = this.props.user?.userInfo?.id;
        let path = 'indexPages/home/index'
        if(commentId){
            path =  `/indexPages/thread/comment/index?id=${commentId}&threadId=${threadId}&fromMessage=true`
        }else if( threadId ){
            path =  `/indexPages/thread/index?id=${threadId}`
        }else if(invitePath) {
            path =  invitePath;
        }

        try {
            const paramPath = `/pages/index/index?path=${encodeURIComponent(commentId?path:setUrlParam(path, { inviteCode }))}`;
            let res = null;
            if(this.experienceData){
                res = await readWechatPosterGenqrcode({ params: { path: '/pages/index/index' } });
            }else {
                res = await getMiniCode({ params: { path: paramPath } })
            }

            if(res?.code === 0) {
                this.setState({miniCode: res?.data});
            } else {
                this.setState({miniCode: defaultLogo});
            }
        } catch {
            this.setState({miniCode: defaultLogo})
        }
    }
    render () {
        const thread = this?.data?.threadId ? this.data : ''
        return (
            <Card thread={thread} experienceData={this.experienceData} miniCode={this.state.miniCode} comment={this.commentData} data={this.data}>
            </Card>
            
        )
    }
}

export default Index