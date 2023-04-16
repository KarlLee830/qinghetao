import React from 'react';
import Taro, { eventCenter, getCurrentInstance } from '@tarojs/taro';
import { Icon, Button, Input, Tabs, Toast, Spin, Divider } from '@discuzqsdk/design';
import { View, Image, CoverView } from '@tarojs/components';
import { goodImages } from '@common/constants/const';
import styles from '../index.module.scss';
import ShopProductItem from '../../../components/shopProductItem';
import { isShowMiniShopTab } from '../../../common';
import classnames from 'classnames';

const MINI_SHOP_TYPE = 11;
const PLATFORM_SHOP_TYPE = 10;

export default class SelectProduct extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: 'miniShop', // 当前选中的 tab 类别
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

  $instance = getCurrentInstance();

  init = () => {
    const currentPluginStore = this.props.pluginAction.get('shop');

    let { activeTab = 'miniShop' } = currentPluginStore || {};

    if (!isShowMiniShopTab(this.props)) {
      if (activeTab === 'miniShop') {
        activeTab = 'platformShop';
      }
    }

    const { body } = currentPluginStore.renderData || {};
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
      activeTab,
    });
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

  componentDidMount = () => {
    const onReadyEventId = this.$instance.router.onReady;
    const onShowEventId = this.$instance.router.onShow;

    // 监听
    eventCenter.on(onShowEventId, this.onShow);
    eventCenter.once(onReadyEventId, this.onReady);
    this.props.pluginAction.registerLifecycle('onReachBottom', this.onReachBottom);
  }

  componentWillUnmount() {
    const onReadyEventId = this.$instance.router.onReady;
    const onShowEventId = this.$instance.router.onShow;

    eventCenter.off(onShowEventId, this.onShow);
    eventCenter.off(onReadyEventId, this.onReady);
  }

  handleConfirm = async () => {
    let product;
    if (this.state.link) {
      product = await this.fetchProductAnalysis({ address: this.state.link });
    }

    const miniShopProducts = Object.keys(this.state.selectedMiniShopProducts);

    const postData = this.postDataAdapter({
      product,
      miniShopProducts,
    });

    this.props.pluginAction.set('shop', {
      shopPluginData: {
        postData: {
          tomId: '61540fef8f4de8',
          body: {
            products: postData,
          },
        },
      },
    });

    Taro.navigateBack();
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
   * 触底逻辑
   */
  onReachBottom = () => {
    if (this.state.currentPage < this.state.totalPage) {
      this.fetchMiniShopProductList(this.state.currentPage + 1);

      this.setState({
        currentPage: this.state.currentPage + 1,
      });
    }
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

  // on ready 生命周期
  onReady = () => {};

  // on show 生命周期
  onShow = async () => {
    if (isShowMiniShopTab(this.props)) {
      await this.fetchMiniShopProductList();
    }
    this.init();
  };

  miniShopProductsAdapter = () => {
    let formatedMiniShopProducts = [];
    const { miniShopProducts } = this.state;

    for (const page in miniShopProducts) {
      formatedMiniShopProducts = [...formatedMiniShopProducts, ...miniShopProducts[page]];
    }

    return formatedMiniShopProducts;
  };

  /**
   * 渲染小商店 tab
   */
  renderMiniShopTab = () => (
      <Tabs.TabPanel key={'miniShop'} id={'miniShop'} label={'添加微信小店商品'}>
        <Divider />
        <View className={styles.productItemWrapper} ref={this.miniShopListRef} onScroll={this.handleListScroll}>
          {this.miniShopProductsAdapter().map(productInfo => (
            <ShopProductItem
              isSelected={this.state.selectedMiniShopProducts[productInfo.productId]}
              onSelected={(checkedStatus) => {
                this.handleProductSelected(checkedStatus, productInfo);
              }}
              productInfo={productInfo}
            />
          ))}
          {this.state.loading && (
            <View className={styles.spinner}>
              <Spin type="spinner">加载中...</Spin>
            </View>
          )}
        </View>
      </Tabs.TabPanel>
  );

  /**
   * 渲染平台商品 tab
   */
  renderPlatformShopTab = () => {
    const { siteData: site } = this.props;
    const { link } = this.state;
    const { envConfig } = site;
    return (
      <Tabs.TabPanel key={'platformShop'} id={'platformShop'} label={'添加平台商品链接'}>
        <Divider />
        <View className={styles.platformShopBox}>
          <View className={styles['parse-goods-box']}>
            <View className={styles.wrapper}>
              <View className={styles['parse-goods-image']}>
                {goodImages.map(item => (
                  <View className={styles['image-item']} key={item.name}>
                    <Image
                      src={`${envConfig.COMMON_BASE_URL}/${item.src}`}
                      style={{ width: `${item.width}px`, height: `${item.height}px` }}
                    />
                    <View className={styles['image-text']}>{item.name}</View>
                  </View>
                ))}
              </View>
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
            </View>
          </View>
        </View>
      </Tabs.TabPanel>
    );
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
    return (
      <View className={classnames(styles.shopPageWrapper, styles.shopPageWrapperMini)}>
          <Tabs
            scrollable={false}
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
        <View className={styles.footer}>
          <Button type="primary" full onClick={this.handleConfirm}>
            确定
          </Button>
        </View>
      </View>
    );
  }
}
