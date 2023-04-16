/**
 * at选择弹框组件。默认展示相互关注人员，搜索关键字按照站点全体人员查询
 * @prop {boolean} visible 是否显示弹出层
 * @prop {function} onCancel 取消
 * @prop {function} getAtList 确定
 */
import React, { Component } from 'react';
import { Popup, Input, Checkbox, Avatar, Button, Icon, Toast } from '@discuzqsdk/design';
import styles from './index.module.scss';
import { inject, observer } from 'mobx-react';
import PropTypes from 'prop-types';
import List from '@components/list';
import MemberBadge from '@components/member-badge';

import stringToColor from '@common/utils/string-to-color';

@inject('threadPost')
@inject('search')
@observer
class AtSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      keywords: '', // 搜索关键字
      checkUser: [], // 当前选择的at人
      page: 1,
      perPage: 10,
      finish: false,
    };
    this.timer = null;
  }

  componentDidMount() {
    this.onScrollBottom();
  }

  async fetchFollow() {
    const { threadPost } = this.props;
    const { page, perPage } = this.state;
    const ret = await threadPost.fetchFollow({ page, perPage });
    if (ret?.code === 0) {
      this.setState({
        page: page + 1,
        finish: page * perPage > threadPost.followsTotalCount,
      });
    } else {
      this.setState({ finish: true })
      Toast.error({ content: ret.msg });
    }
  }

  async fetchAllUser() {
    const { search } = this.props;
    const { page, perPage } = this.state;
    const keywords = this.getSearchKeyword();
    const ret = await search.getUsersList({ search: keywords, type: 'nickname', page, perPage });
    const { code, data } = ret;
    if (code === 0) {
      this.setState({
        // fix: 请求结束后，如果当前搜索关键字已经变化，就重置page
        page: keywords === this.getSearchKeyword() ? page + 1 : 1,
        finish: page * perPage >= data?.totalCount,
      });
    } else {
      this.setState({ finish: true });
      Toast.error({ content: ret.msg });
    }
  }

  // 更新搜索关键字,搜索用户
  updateKeywords(val = "") {
    this.setState({
      keywords: val,
      // checkUser: [], // 重新搜索时不清空已选用户
      page: 1,
      finish: false,
    });
    this.searchInput();
  }

  // 搜索用户
  searchInput() {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.onScrollBottom();
    }, 300);
  }

  onScrollBottom = () => (this.getSearchKeyword() ? this.fetchAllUser() : this.fetchFollow())

  // 取消选择
  handleCancel = () => {
    this.props.onCancel();
  };

  // 确认选择
  submitSelect() {
    if (this.state.checkUser.length === 0) {
      return;
    }
    this.props.getAtList(this.state.checkUser);
    this.props.threadPost.setEditorHintAtKey('');
    this.props.onCancel();
  }

  // 获取显示文字头像的背景色
  getBackgroundColor = (name) => {
    const character = name ? name.charAt(0).toUpperCase() : "";
    return stringToColor(character);
  }

  getSearchKeyword = () => this.state.keywords || this.props.threadPost.editorHintAtKey;

  formatData = (item) => {
    const isFollow = !this.getSearchKeyword();
    const avatar = isFollow ? item?.user?.avatar : item.avatar;
    const username = isFollow ? item?.user?.userName : item.username;
    const nickname = isFollow ? item?.user?.nickname : item.nickname;
    const groupName = isFollow ? item?.group?.groupName : item.groupName;
    const level = isFollow ? item?.group?.level : item.level;
    const userId = isFollow ? item.user?.userId : item.userId;
    return { avatar, username, groupName, level, userId, nickname };
  }

  renderItem() {
    const { threadPost, search } = this.props;
    const data = this.getSearchKeyword()
      ? (search.users?.pageData || []) : (threadPost.follows || []);

    if (data.length === 0) return null;
    return data.map((item) => {
      const { avatar, nickname, groupName, userId, level } = this.formatData(item);

      return (
        <div className={styles['at-item']} key={userId}>
          <div className={styles['at-item__inner']} >
            <Checkbox name={nickname}>
              <div className={styles.avatar}>
                {avatar
                  ? <Avatar image={avatar} />
                  : <Avatar
                    text={nickname.toUpperCase()}
                    style={{
                      backgroundColor: `#${this.getBackgroundColor(nickname)}`,
                    }}
                  />
                }
              </div>
              <div className={styles.info}>
                <div className={styles.username}>{nickname}</div>
                {
                  level ?
                  <MemberBadge
                    className={styles.group}
                    groupLevel={level}
                    groupName={groupName}
                  />
                  :
                  <div className={styles.group}>{groupName}</div>
                }
              </div>
            </Checkbox>
          </div>
        </div>
      );
    });
  }

  render() {
    const { pc, visible, style = {}, threadPost } = this.props;
    const { keywords, checkUser, finish } = this.state;
    const platform = pc ? 'pc' : 'h5';
    const searchWord = keywords || threadPost.editorHintAtKey;
    const content = (
      <div className={styles.wrapper} onClick={e => e.stopPropagation()}>

        {/* top */}
        <div className={styles.header}>
          <div className={styles['input-box']}>
            {!pc && <div className={styles['icon-box']}>
              <Icon className={styles['search-icon']} name="SearchOutlined" size={16}></Icon>
            </div>}
            <Input
              value={searchWord}
              placeholder='选择好友或直接输入圈友'
              onChange={e => this.updateKeywords(e.target.value)}
            />
            {!pc && searchWord
              && <div className={styles['icon-box']} onClick={() => this.updateKeywords()}>
                <Icon className={styles['delete-icon']} name="WrongOutlined" size={16}></Icon>
              </div>
            }
          </div>
          {!pc &&
            <div className={styles['btn-cancel']} onClick={this.handleCancel}>取消</div>
          }
        </div>

        {/* list */}
        <Checkbox.Group
          className={styles['check-box']}
          value={checkUser}
          onChange={val => this.setState({ checkUser: val })}
        >
          <List
            showLoadingInCenter
            className={styles.list}
            wrapperClass={styles['list__inner']}
            height={pc ? 'auto' : 'calc(100vh - 120px)'}
            noMore={finish}
            onRefresh={this.onScrollBottom}
            immediateCheck={false}
            platform={platform}
          >
            {this.renderItem()}
          </List>
        </Checkbox.Group>

        {/* 确认按钮 */}
        <div className={styles['btn-container']}>
          <Button
            className={checkUser.length > 0 ? styles.selected : ''}
            onClick={() => this.submitSelect()}
          >
            {checkUser.length ? `@ 已选(${checkUser.length})` : '尚未选'}
          </Button>
        </div>
      </div >
    );

    if (pc) return (
      <div className={styles.pc} style={style} id="dzq-toolbar-at">
        <div className={styles.pcHeader}>@圈友</div>
        {content}
      </div>
    );

    return (
      <Popup
        className={`${styles.popup}`}
        position="center"
        visible={visible}
      >
        {content}
      </Popup>
    );
  }
}

AtSelect.propTypes = {
  visible: PropTypes.bool.isRequired,
  onCancel: PropTypes.func.isRequired,
  getAtList: PropTypes.func.isRequired,
};

AtSelect.defaultProps = {
  visible: false,
  onCancel: () => { },
  getAtList: () => { },
};

export default AtSelect;
