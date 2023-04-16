import React from 'react';
import { Icon, Dialog, Button, Input, Textarea, Radio, Toast, Tabs, Spin } from '@discuzqsdk/design';
import { goodImages } from '@common/constants/const';
import ShopProductItem from '../../../components/shopProductItem';
import { readProcutAnalysis } from '@common/server';
import styles from '../index.module.scss';
import EventBus from '../../../event';
import { isShowMiniShopTab } from '../../../common';

const MINI_SHOP_TYPE = 11;
const PLATFORM_SHOP_TYPE = 10;

export default class ShopPostEntry extends React.Component {
  constructor(props) {
    super(props);
    console.log('post entry');

    this.state = {
      visible: false,
      activeTab: '', // 当前选中的 tab 类别
      link: '', // 平台商品的解析链接
      currentPage: 1, // 小商店的当前页数
      totalPage: 1, // 小商店的总页数
      totalCount: 0, // 小商店的商品总数
      miniShopProducts: {}, // 小商店的商品列表
      selectedMiniShopProducts: {}, // 选中的小商店商品
      loading: false, // 是否正在加载中
      fetchError: '', // 加载错误信息
      products: {},
    };
  }

  miniShopListRef = React.createRef(null);

  // 加载当前 postData 中的基础数据
  componentDidMount() {
    this.init();

    if (isShowMiniShopTab(this.props)) {
      this.setState({
        activeTab: 'miniShop',
      });
    } else {
      this.setState({
        activeTab: 'platformShop',
      });
    }

    EventBus.addEventListener('showMiniDialog', this.handleMiniDialogOpen);
    EventBus.addEventListener('showPlatformDialog', this.handlePlatformDialogOpen);
  }

  componentWillUnmount() {
    EventBus.removeEventListener('showMiniDialog', this.handleMiniDialogOpen);
    EventBus.removeEventListener('showPlatformDialog', this.handlePlatformDialogOpen);
  }

  // 如果有外层导致的渲染数据更新，重新更新选中的范围
  componentDidUpdate(prevProps) {
    if (prevProps.renderData !== this.props.renderData) {
      this.init();
    }
  }

  init = () => {
    const { renderData } = this.props;
    const { body } = renderData || { body: { products: [] } };
    const { products } = body || { products: [] };

    let platformProductLink = '';
    const currentMiniShopProducts = {};

    products.forEach((productInfo) => {
      if (productInfo.type === MINI_SHOP_TYPE) {
        currentMiniShopProducts[productInfo.data.productId] = productInfo.data;
      }

      if (productInfo.type === PLATFORM_SHOP_TYPE) {
        platformProductLink = productInfo.data.readyContent;
      }
    });

    this.setState({
      selectedMiniShopProducts: currentMiniShopProducts,
      link: platformProductLink,
    });
  };

  handleMiniDialogOpen = () => {
    this.setState({
      activeTab: 'miniShop',
    });
    this.props.pluginAction.set('shop', {
      activeTab: 'miniShop',
    });
    this.handleDialogOpen();
  };

  handlePlatformDialogOpen = () => {
    this.setState({
      activeTab: 'platformShop',
    });
    this.props.pluginAction.set('shop', {
      activeTab: 'platformShop',
    });
    this.handleDialogOpen();
  };

  handleDialogOpen = async () => {
    const { siteData } = this.props;
    const isPc = siteData.platform !== 'h5';

    if (isPc) {
      this.setState({ visible: true });

      if (
        isShowMiniShopTab(this.props) && 
        Object.keys(this.state.miniShopProducts).length === 0 // 没有加载过，才会在刚进来就加载
      ) {
        await this.fetchMiniShopProductList();
      }

    } else {
      const { dzqRouter } = this.props;
      const { router } = dzqRouter;

      const currentPluginStore = this.props.pluginAction.get('shop');
      if (currentPluginStore) {
        this.props.pluginAction.set('shop', {
          ...currentPluginStore,
          renderData: this.props.postData.plugin.shop,
        });
      } else {
        this.props.pluginAction.set('shop', {
          renderData: this.props.postData.plugin.shop,
        });
      }

      router.push('/plugin/selectProduct');
    }
  };

  handleDialogClose = () => {
    this.init();
    this.setState({ visible: false });
  };

  fetchMiniShopProductList = async (page) => {
    const { dzqRequest } = this.props;

    // 请求前 loading
    this.setState({
      loading: true,
    });

    try {
      const { code, data, msg } = await dzqRequest.request.http({
        url: '/plugin/shop/api/wxshop/list',
        method: 'GET',
        params: {
          page,
          perPage: '16',
        },
      });

      if (code !== 0) {
        Toast.error({
          content: msg,
        });
      }

      const { totalCount, totalPage, pageData, currentPage } = data;

      const { miniShopProducts } = this.state;

      const nextMiniShopProducts = Object.assign(
        {},
        {
          [currentPage]: pageData,
          ...miniShopProducts,
        },
      );
      this.setState({
        totalPage,
        totalCount,
        miniShopProducts: nextMiniShopProducts,
      });

      this.setState({
        loading: false,
      });

      return nextMiniShopProducts;
    } catch (error) {
      this.setState({
        loading: false,
      });

      this.props.dzqRequestHandleError(error);
    }
  };

  /**
   * 发布数据格式化函数
   */
  postDataAdapter = ({ miniShopProducts = [], product }) => {
    const products = [];

    if (miniShopProducts.length) {
      miniShopProducts.forEach((productId) => {
        products.push({
          type: MINI_SHOP_TYPE,
          data: {
            productId,
            ...this.state.selectedMiniShopProducts[productId],
          },
        });
      });
    }

    if (product) {
      products.push({
        type: PLATFORM_SHOP_TYPE,
        data: product,
      });
    }

    return products;
  };

  handleDialogConfirm = async () => {
    let product;
    if (this.state.link) {
      product = await this.fetchProductAnalysis({ address: this.state.link });
    }

    const miniShopProducts = Object.keys(this.state.selectedMiniShopProducts);

    const postData = this.postDataAdapter({
      product,
      miniShopProducts,
    });

    this.props.onConfirm({
      postData: {
        tomId: '61540fef8f4de8',
        body: {
          products: postData,
        },
      },
    });

    this.handleDialogClose();
  };

  /**
   * 插件入口是否显示判断
   */
  isShowShopIcon = () => {
    const { siteData, _pluginInfo } = this.props;
    const { pluginConfig } = siteData;
    if (!pluginConfig) return false;
    const [act] = (pluginConfig || []).filter(item => item.app_id === _pluginInfo.options.tomId);
    if (act?.authority?.canUsePlugin) return true;
    return false;
  };

  readProductAnalysis = async ({ data }) => {
    const { dzqRequest } = this.props;
    const ret = await dzqRequest.request.http({
      url: '/plugin/shop/api/goods/analysis',
      method: 'POST',
      data,
    });
    return ret;
  };

  /**
   * 获取商品信息
   * @param {*} options
   */
  fetchProductAnalysis = async (options = {}) => {
    const ret = await this.readProductAnalysis({ data: options });
    const { code, data = {}, msg } = ret;
    if (code === 0) {
      return data;
    }
    Toast.error({ content: msg });
  };

  /**
   * 处理点击行为
   * @param {*} checkedStatus
   * @param {*} productInfo
   */
  handleProductSelected = (checkedStatus, productInfo) => {
    const { productId } = productInfo;

    const nextSelectedStatus = Object.assign({}, this.state.selectedMiniShopProducts);

    if (checkedStatus) {
      if (Object.keys(this.state.selectedMiniShopProducts).length >= 10) {
        Toast.error({
          content: '最多只能同时选择十条小商店商品'
        })
        return;
      }
      
      nextSelectedStatus[productId] = productInfo;
    } else {
      delete nextSelectedStatus[productId];
    }

    this.setState({
      selectedMiniShopProducts: nextSelectedStatus,
    });
  };

  // 处理触底加载
  handleReachBottom = () => {
    if (this.state.currentPage < this.state.totalPage) {
      this.fetchMiniShopProductList(this.state.currentPage + 1);

      this.setState({
        currentPage: this.state.currentPage + 1,
      });
    }
  };

  // 滚动行为监听
  handleListScroll = (e) => {
    const { scrollTop } = e.target;
    const { scrollHeight } = e.target;
    const offsetHeight = Math.ceil(e.target.getBoundingClientRect().height);
    const currentHeight = scrollTop + offsetHeight;
    if (currentHeight >= scrollHeight) {
      this.handleReachBottom();
    }
  };

  /**
   * 渲染小商店 tab
   */
  renderMiniShopTab = () => {
    if (!isShowMiniShopTab(this.props)) return null;

    return (
      <Tabs.TabPanel key={'miniShop'} id={'miniShop'} label={'添加微信小店商品'}>
        <div className={styles.productItemWrapper} ref={this.miniShopListRef} onScroll={this.handleListScroll}>
          {this.miniShopProductsAdapter().map(productInfo => (
            <ShopProductItem
              isSelected={this.state.selectedMiniShopProducts[productInfo.productId]}
              onSelected={(checkedStatus) => {
                this.handleProductSelected(checkedStatus, productInfo);
              }}
              productInfo={productInfo}
            />
          ))}
        </div>
        {this.state.loading && (
            <div className={styles.spinner}>
              <Spin type="spinner">加载中...</Spin>
            </div>
          )}
      </Tabs.TabPanel>
    );
  };

  /**
   * 渲染平台商品 tab
   */
  renderPlatformShopTab = () => {
    const { link } = this.state;
    return (
      <Tabs.TabPanel key={'platformShop'} id={'platformShop'} label={'添加平台商品链接'}>
        <div className={styles.platformShopBox}>
          <div className={styles['parse-goods-box']}>
            <div className={styles.wrapper}>
              <div className={styles['parse-goods-title']}>现支持以下商品链接</div>
              <div className={styles['parse-goods-image']}>
                {goodImages.map(item => (
                  <div className={styles['image-item']} key={item.name}>
                    <img src={item.src} alt={item.name} width={item.width} height={item.height} />
                    <span className={styles['image-text']}>{item.name}</span>
                  </div>
                ))}
              </div>
              <Input.Textarea
                value={link}
                placeholder="请粘贴\输入商品的分享链接"
                maxLength={49999}
                rows={8}
                onChange={(e) => {
                  this.setState({
                    link: e.target.value,
                  });
                }}
              />
            </div>
          </div>
        </div>
      </Tabs.TabPanel>
    );
  };

  miniShopProductsAdapter = () => {
    let formatedMiniShopProducts = [];
    const { miniShopProducts } = this.state;

    for (const page in miniShopProducts) {
      formatedMiniShopProducts = [...formatedMiniShopProducts, ...miniShopProducts[page]];
    }

    return formatedMiniShopProducts;
  };

  renderTabs() {
    const tabs = [];

    if (isShowMiniShopTab(this.props)) {
      tabs.push(this.renderMiniShopTab());
    }

    tabs.push(this.renderPlatformShopTab());

    return tabs;
  }

  render() {
    const { visible } = this.state;

    if (!this.isShowShopIcon()) return null;

    return (
      <>
        <Icon onClick={this.handleDialogOpen} name="ShoppingCartOutlined" size="20" />
        <Dialog
          visible={visible}
          onCancel={this.handleDialogClose}
          onClose={this.handleDialogClose}
          onConfirm={this.handleDialogConfirm}
          isNew={true}
          type="confirm"
          title="添加商品"
          bodyClassName={styles.shopDialogBody}
          className={styles.shopDialog}
        >
          <Tabs
            scrollable={true}
            type={'primary'}
            activeId={this.state.activeTab}
            onActive={(activeId) => {
              this.setState({
                activeTab: activeId,
              });
            }}
          >
            {this.renderTabs()}
          </Tabs>
        </Dialog>
      </>
    );
  }
}
