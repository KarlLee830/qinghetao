import React from 'react';
import { Toast, Button, Input, Dialog, Icon } from '@discuzqsdk/design';
import styles from './PluginDevelopTools.module.scss';
import { inject, observer } from 'mobx-react';
import DZQPluginCenter from '@discuzqsdk/plugin-center';

@inject('plugin')
@observer
class PluginDevelopTools extends React.Component {
   
    constructor(props) {
        super(props);
        this.state = {
            isShowEnter: false,
            showDialog: false,
            custormPlugin: '',
            configStr: ''
        }
    }

    componentDidMount() {
        if (window.localStorage.getItem('openPluginEnter')) {
            const config = window.sessionStorage.getItem('plugin_config')
            this.setState({
                isShowEnter: true,
                configStr: config || ''
            })
        }
    }

    closeDialog() {
        this.setState({
            showDialog: false
        })
    }

    toggleDialog() {
        this.setState({
            showDialog: !this.state.showDialog
        })
    }

    submit() {
        try {
            const configJson = JSON.parse(this.state.configStr);
            window.sessionStorage.setItem('plugin_config', this.state.configStr)
            for ( let key in configJson ) {
                this.requestPlugin(key, configJson[key]);
            }
            this.closeDialog();
        } catch(err) {
            Toast.error({
                content: err.message,
            });
        }
    }

    requestPlugin(name, data) {

        const { css, js } = data;
        const done = {};

        for ( let i = 0; i < js.length; i++ ) {
            done[js[i]] = false;
            const script = document.createElement('script');
            script.src = js[i];
            script.onload = () => {
                done[js[i]] = true;
                for ( let key in done ) {
                    if (done[key] === false) return;
                }
                const result = DZQPluginCenter.register(window.DZQPlugin[name].default);
                if ( result ) {
                    this.props.plugin.setPluginComponent(result.pluginName, result.map);
                }
            }
            script.onerror = () => {
                Toast.error({
                    content: `加载失败：${js[i]}`,
                });
            }
            document.body.appendChild(script);
        }

        for ( let i = 0; i < css.length; i++ ) {
            done[css[i]] = false;
            const link = document.createElement('link');
            link.href = css[i];
            link.rel = 'stylesheet';
            link.type = 'text/css';
            link.onload = () => {
                done[css[i]] = true;
                for ( let key in done ) {
                    if (done[key] === false) return;
                }
                const result = DZQPluginCenter.register(window.DZQPlugin[name].default);
                if ( result ) {
                    this.props.plugin.setPluginComponent(result.pluginName, result.map);
                }
            }
            link.onerror = () => {
                Toast.error({
                    content: `加载失败：${js[i]}`,
                });
            }
            document.head.appendChild(link);
        }

    }

    render() {
        const { plugin } = this.props;
        if ( !this.state.isShowEnter ) return null;


        return (<div>
        
            <div className={styles.pluginDevelopToolsEnter} onClick={e => {
                e.stopPropagation();
                this.toggleDialog()
            }}>
                <Icon
                    className={styles.icon}
                    name='SettingOutlined'
                    size="18" 
                />
                <p>插件配置</p>
            </div>
            <Dialog
                title="提示"
                visible={this.state.showDialog}
                className={styles.plguinBox}
                bodyStyle={{
                    height: '70%',
                    overflowY: 'auto'
                }}
                footer={(
                    <div>
                        <Button onClick={() => {
                            this.setState({
                                configStr: ''
                            })
                        }}>
                            清空
                        </Button>
                        <Button type="primary" onClick={() => {
                            this.submit()
                        }}>
                            确认
                        </Button>
                    </div>
                )}
            >
                <Input.Textarea
                    value={this.state.configStr}
                    placeholder="填入插件配置"
                    autoFocus={true}
                    rows={10}
                    onChange={(e) => {
                        this.setState({
                            configStr: e.target.value
                        })
                    }}
                />
            </Dialog>
        </div>)
    }
}

export default PluginDevelopTools;