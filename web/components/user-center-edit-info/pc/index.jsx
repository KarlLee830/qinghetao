import React, { Component, Suspense } from 'react';
import Header from '@components/header';
import UserCenterEditHeader from '../../user-center-edit-header/index';
import BaseLaout from '@components/base-layout';
import { Button, Spin, Input, Toast } from '@discuzqsdk/design';
import styles from './index.module.scss';
import Avatar from '@components/avatar';
import { inject, observer } from 'mobx-react';
import Router from '@discuzqsdk/sdk/dist/router';
import HOCFetchSiteData from '../../../middleware/HOCFetchSiteData';
import UserCenterEditAccountPwd from '../../user-center-edit-account-pwd-pc';
import UserCenterEditMobile from '../../user-center-edit-mobile-pc';
import UserCenterEditPaypwd from '../../user-center-edit-paypwd-pc';
import UserCenterAdditionalInfo from '../../user-center/additional-info-pc/index';
import Copyright from '@components/copyright';
import { getClientHeight } from '@common/utils/get-client-height';
import isServer from '@common/utils/is-server';
import { isExtFieldsOpen } from '@common/store/login/util';

@inject('site')
@inject('user')
@observer
class index extends Component {
  constructor(props) {
    super(props);
    this.props.user.initEditInfo();
    this.state = {
      isClickNickName: false,
      accountEditorVisible: false,
      payPwdEditorVisible: false,
      mobileEditorVisible: false,
      wechatRebindEditorVisible: false,
      additionalUserInfoVisible: false, // 补充信息状态
      editorConfig: [
        {
          name: '昵称',
          display: 'show',
          condition: () => true,
          render: () => this.props.user.nickname,
          operation: () => (
            <p onClick={() => this.openInputEditor('昵称')} className={styles.pcEditNicknameCallMsodify}>
              修改
            </p>
          ),
          inputEditor: () => (
            <Input
              value={this.props.user.editNickName}
              onChange={(e) => {
                this.props.user.editNickName = e.target.value;
              }}
              className={styles.pcEditAutographInput}
            />
          ),
          onSave: async () => {
            try {
              this.saveInputEditor('昵称');
              await this.props.user.updateEditedUserNickname();
              Toast.success({
                content: '更新昵称成功',
                duration: 2000,
              });
              this.closeInputEditor('昵称');
            } catch (e) {
              console.error(e);
              if (e.Code) {
                Toast.error({
                  content: e.Message,
                  duration: 2000,
                });
                this.props.user.editNickName = '';
                this.cancelInputConfirmEditor('昵称');
              }
            }
          },
          onCancel: () => {
            this.closeInputEditor('昵称');
          },
        },
        {
          name: '用户名',
          display: 'show',
          condition: () => true,
          render: () => this.props.user.username,
          operation: () => {
            if (!this.props.user.canEditUsername) {
              return <p className={styles.pcEditNicknameCallMsodifyDisable}>暂无法修改（一年一次）</p>;
            }
            return (
              <p onClick={() => this.openInputEditor('用户名')} className={styles.pcEditNicknameCallMsodify}>
                修改
              </p>
            );
          },
          inputEditor: () => (
            <Input
              value={this.props.user.editUserName}
              onChange={(e) => {
                this.props.user.editUserName = e.target.value;
              }}
              className={styles.pcEditAutographInput}
            />
          ),
          onSave: async () => {
            try {
              this.saveInputEditor('用户名');
              await this.props.user.updateUsername();
              Toast.success({
                content: '更新用户名成功',
                duration: 2000,
              });
              this.closeInputEditor('用户名');
            } catch (e) {
              console.error(e);
              if (e.Code) {
                Toast.error({
                  content: e.Msg,
                  duration: 2000,
                });
              }
              this.props.user.editUserName = '';
              this.cancelInputConfirmEditor('用户名');
            }
          },
          onCancel: () => {
            this.closeInputEditor('用户名');
          },
        },
        {
          name: '个性签名',
          display: 'show',
          condition: () => true,
          render: () => this.props.user.signature || '这个人很懒，什么也没留下~',
          operation: () => (
            <p onClick={() => this.openInputEditor('个性签名')} className={styles.pcEditNicknameCallMsodify}>
              修改
            </p>
          ),
          inputEditor: () => (
            <Input
              value={this.props.user.editSignature}
              onChange={(e) => {
                this.props.user.editSignature = e.target.value;
              }}
              className={styles.pcEditAutographInput}
            />
          ),
          onSave: async () => {
            try {
              this.saveInputEditor('个性签名');
              this.props.user.editSignature = this.props.user.editSignature.trim()
              await this.props.user.updateEditedUserSignature();
              Toast.success({
                content: '更新个性签名成功',
                duration: 2000,
              });
              this.closeInputEditor('个性签名');
            } catch (e) {
              console.error(e);
              if (e.Code) {
                Toast.error({
                  content: e.Message,
                  duration: 2000,
                });
                this.props.user.editSignature = '';
                this.cancelInputConfirmEditor('个性签名');
              }
            }
          },
          onCancel: () => {
            this.closeInputEditor('个性签名');
          },
        },
        {
          name: '手机号码',
          display: 'show',
          render: () => this.props.user.mobile || '未设置',
          condition: () => this.props.site?.isSmsOpen,
          operation: () => {
            if (!this.props.user.mobile) {
              return (
                <p
                  onClick={() => {
                    Router.push({ url: '/user/bind-phone' });
                  }}
                  className={styles.pcEditNicknameCallMsodify}
                >
                  去绑定
                </p>
              );
            }
            return (
              <p
                onClick={() => {
                  this.setState({
                    mobileEditorVisible: true,
                  });
                }}
                className={styles.pcEditNicknameCallMsodify}
              >
                修改
              </p>
            );
          },
          inputEditor: () => null,
        },
        {
          name: '账户密码',
          display: 'show',
          condition: () => true,
          render: () => {
            if (this.props.user.hasPassword) {
              return '已设置';
            }
            return '未设置';
          },
          operation: () => (
            <p
              onClick={() => {
                this.setState({
                  accountEditorVisible: true,
                });
              }}
              className={styles.pcEditNicknameCallMsodify}
            >
              {this.props.user?.hasPassword ? '修改' : '设置'}
            </p>
          ),
          inputEditor: () => null,
        },
        {
          name: '支付密码',
          display: 'show',
          condition: () => true,
          render: () => {
            if (this.props.user.canWalletPay) {
              return '已设置';
            }
            return '未设置';
          },
          operation: () => (
            <p
              onClick={() => {
                this.setState({
                  payPwdEditorVisible: true,
                });
              }}
              className={styles.pcEditNicknameCallMsodify}
            >
              {this.props.user?.canWalletPay ? '修改' : '设置'}
            </p>
          ),
          inputEditor: () => null,
        },
        {
          name: '微信',
          display: 'show',
          condition: () => {
            // 条件都满足时才显示微信
            const IS_WECHAT_ACCESSABLE = this.props.site.wechatEnv !== 'none';
            return IS_WECHAT_ACCESSABLE;
          },
          render: () => {
            const IS_WECHAT_HAS_BIND = Boolean(this.user.wxNickname);
            if (!IS_WECHAT_HAS_BIND) {
              return (
                <div className={styles.pcEditNicknameImgs}>
                  <p className={styles.pcEditWeiName}>未绑定</p>
                </div>
              );
            }
            return (
              <div className={styles.pcEditNicknameImgs}>
                <Avatar
                  className={styles.pcEditNicknameImg}
                  image={this.user.wxHeadImgUrl}
                  name={this.user.wxNickname}
                />
                <p className={styles.pcEditWeiName}>{this.user.wxNickname}</p>
              </div>
            );
          },
          operation: () => {
            const IS_WECHAT_HAS_BIND = Boolean(this.user.wxNickname);

            if (!IS_WECHAT_HAS_BIND) {
              return (
                <p
                  onClick={() => {
                    Router.push({ url: '/user/wx-bind-qrcode' });
                  }}
                  className={styles.pcEditNicknameCallMsodify}
                >
                  去绑定
                </p>
              );
            }

            return (
              <p
                onClick={() => {
                  Router.push({ url: '/user/rebind' });
                }}
                className={styles.pcEditNicknameCallMsodify}
              >
                换绑
              </p>
            );
          },
          // <p
          //   onClick={() => {
          //     this.setState({
          //       wechatRebindEditorVisible: true,
          //     });
          //   }}
          //   className={styles.pcEditNicknameCallMsodify}
          // >
          //   换绑
          // </p>
          // operation: () => null,
          inputEditor: () => null,
        },
        {
          name: '补充信息',
          display: 'show',
          condition: () => {
            const ISEXT_FIELD_OPENS = isExtFieldsOpen(this.props?.site);
            return ISEXT_FIELD_OPENS;
          },
          render: () => {
            '查看';
          },
          operation: () => (
            <p
              onClick={() => {
                this.setState({
                  additionalUserInfoVisible: true,
                });
              }}
              className={styles.pcEditNicknameCallMsodify}
            >
              查看
            </p>
          ),
          inputEditor: () => null,
        },
      ],
    };
    this.user = this.props.user || {};
  }

  saveInputEditor = (name) => {
    const { editorConfig } = this.state;
    const targetConfig = editorConfig.filter(item => item.name === name);
    if (targetConfig.length) {
      targetConfig[0].isConfirm = true;
      this.setState({
        editorConfig: [...editorConfig],
      });
    }
  };

  cancelInputConfirmEditor = (name) => {
    const { editorConfig } = this.state;
    const targetConfig = editorConfig.filter(item => item.name === name);
    if (targetConfig.length) {
      targetConfig[0].isConfirm = false;
      this.setState({
        editorConfig: [...editorConfig],
      });
    }
  };

  openInputEditor(name) {
    const { editorConfig } = this.state;
    const targetConfig = editorConfig.filter(item => item.name === name);
    if (targetConfig.length) {
      targetConfig[0].display = 'edit';
      this.setState({
        editorConfig: [...editorConfig],
      });
    }
  }

  closeInputEditor(name) {
    const { editorConfig } = this.state;
    const targetConfig = editorConfig.filter(item => item.name === name);
    if (targetConfig.length) {
      targetConfig[0].display = 'show';
      targetConfig[0].isConfirm = false;
      this.setState({
        editorConfig: [...editorConfig],
      });
    }
  }

  editorialpresentation(item) {
    // render content
    const content = item.render() || null;
    // 如果不满足条件，不渲染
    if (!item.condition()) return null;
    return (
      <>
        <div className={styles.pcEditNickname}>
          <div className={styles.pcEditNicknameText}>{item.name}</div>
          <div className={styles.box}>
            {item.display === 'show' && (
              <div className={styles.pcEditNicknameCall}>
                <p className={styles.pcEditNicknameCallText}>{content}</p>
                {item.operation() || null}
              </div>
            )}
            {item.display === 'edit' && (
              <div className={item.display === 'edit' ? styles.pcEditAutographCall : styles.pcEditAutographBox}>
                {item.inputEditor()}
                <div className={styles.preservation}>
                  <Button
                    disabled={item.isConfirm}
                    className={styles.preservationButton}
                    type="primary"
                    onClick={() => item.onSave()}
                  >
                    {item.isConfirm ? <Spin type="spinner">保存中...</Spin> : '保存'}
                  </Button>
                  <Button className={styles.preservationButton2} onClick={() => item.onCancel()}>
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  render() {
    const { editorConfig } = this.state;
    let pcEditHeight = 'auto'; // 减去60头部的高度
    if (!isServer()) {
      pcEditHeight = getClientHeight() - 60;
    }
    return (
      <div className={styles.pcEditBox} id={styles.pcEditContainer}>
        <Header className={styles.pcEditHeaser} />
        <div className={styles.pcEditContent}>
          <div className={styles.pcEdit}>
            {/* 头部 */}
            <div>
              <UserCenterEditHeader />
            </div>
            {/* 资料展示 */}
            {editorConfig.map((item, index) => (
              <div key={index}>{this.editorialpresentation(item, item.type, index)}</div>
            ))}
          </div>
          <div className={styles.bottomText}>
            <Copyright center marginTop={0} marginBottom={0} />
          </div>
        </div>

        {/* Popups */}
        <>
          <UserCenterEditAccountPwd
            visible={this.state.accountEditorVisible}
            onClose={() => {
              this.setState({
                accountEditorVisible: false,
              });
            }}
          />
          <UserCenterEditMobile
            visible={this.state.mobileEditorVisible}
            onClose={() => {
              this.setState({
                mobileEditorVisible: false,
              });
            }}
          />
          <UserCenterEditPaypwd
            visible={this.state.payPwdEditorVisible}
            onClose={() => {
              this.setState({
                payPwdEditorVisible: false,
              });
            }}
          />
          <UserCenterAdditionalInfo
            onClose={() => {
              this.setState({
                additionalUserInfoVisible: false,
              });
            }}
            visible={this.state.additionalUserInfoVisible}
          />
        </>
      </div>
    );
  }
}

export default index;
