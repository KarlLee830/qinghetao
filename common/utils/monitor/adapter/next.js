import isServer from '@common/utils/is-server';
class Monitor {
    init () {
        if ( !isServer() ) {
            let serverId = window.localStorage.getItem('serverId');
            if ( !serverId ) {
                serverId = new Date().getTime() + Math.floor(Math.random() * 100);
                window.localStorage.setItem('serverId', serverId);
            }
            return window.Aegis ? new window.Aegis({
                id: 'KqnrSUjzgfvqboCluu', // 项目ID，即上报key
                uin: serverId, // 用户唯一 ID（可选）
                reportApiSpeed: true, // 接口测速
                reportAssetSpeed: true // 静态资源测速
            }) : null
        }
        return null;
    }
    monitor = this.init()
    call (type, data) {
        if ( !this.monitor ) return;
        switch(type) {
            case 'setConfig': this._setConfig(data);
            break;
            case 'info': this._info(data.msg);
            break;
            case 'report': this._report(data.msg);
            break;
            case 'error': this._error(data.msg);
            break;
            case 'reportEvent': this._reportEvent(data.eventName, data.ext);
            break;
            case 'reportTime': this._reportTime(data.eventName, data.duration, data.ext);
            break;
        }
    }

    _setConfig(data) {
        this.monitor.setConfig && this.monitor.setConfig(data);
    }
    _info(msg) {
        this.monitor.info && this.monitor.info(msg);
    }
    _report(msg) {
        this.monitor.report && this.monitor.report(msg);
    }
    _error(msg) {
        this.monitor.error && this.monitor.error(msg);
    }
    _reportEvent(eventName, ext) {
        this.monitor.reportEvent && this.monitor.reportEvent({...ext, name: eventName});
    }
    _reportTime(eventName, duration, ext = {}) {
        this.monitor.reportEvent && this.monitor.reportTime({...ext, name: eventName, duration});
    }

}

export default new Monitor();
