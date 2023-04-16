import React from 'react';
import { Icon, Button, Input, Tabs, Toast, Spin, Divider } from '@discuzqsdk/design';
import { goodImages } from '@common/constants/const';
import styles from '../index.module.scss';
import Header from '@components/header';
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
      isShowMiniShopTabError: '', // 加载错误信息
      products: {},
    };
  }

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

  componentDidMount() {
    if (isShowMiniShopTab(this.props)) {
      this.fetchMiniShopProductList();
    }
    this.init();
  }

  // 处理触底加载
  handleReachBottom = () => {
    const visionHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    const scrolledHeight = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop;
    const actualHeight = document.documentElement.scrollHeight || document.body.scrollHeight;

    if (visionHeight + scrolledHeight === actualHeight) {
      if (this.state.currentPage < this.state.totalPage) {
        this.fetchMiniShopProductList(this.state.currentPage + 1);

        this.setState({
          currentPage: this.state.currentPage + 1,
        });
      }
    }
  };

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

    const { dzqRouter } = this.props;
    const { router } = dzqRouter;

    if (typeof window !== 'undefined') {
      if (window.history.length <= 1) {
        router.replace('/thread/post');
        return;
      }

      router.back();
    }
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

  miniShopProductsAdapter = () => {
    let formatedMiniShopProducts = [];
    const { miniShopProducts } = this.state;

    for (const page in miniShopProducts) {
      formatedMiniShopProducts = [...formatedMiniShopProducts, ...miniShopProducts[page]];
    }

    return formatedMiniShopProducts;
  };

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
  renderMiniShopTab = () => (
      <Tabs.TabPanel key={'miniShop'} id={'miniShop'} label={'添加微信小店商品'}>
        <Divider />
        <div className={styles.productItemWrapperH5} ref={this.miniShopListRef} onScroll={this.handleListScroll}>
          {this.miniShopProductsAdapter().map(productInfo => (
            <ShopProductItem
              isMini
              isSelected={this.state.selectedMiniShopProducts[productInfo.productId]}
              onSelected={(checkedStatus) => {
                this.handleProductSelected(checkedStatus, productInfo);
              }}
              productInfo={productInfo}
            />
          ))}
          {this.state.loading && (
            <div className={styles.spinner}>
              <Spin type="spinner">加载中...</Spin>
            </div>
          )}
        </div>
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
        <div className={styles.platformShopBox}>
          <div className={styles['parse-goods-box']}>
            <div className={styles.wrapper}>
              <div className={styles['parse-goods-image']}>
                {goodImages.map(item => (
                  <div className={styles['image-item']} key={item.name}>
                    <img src={item.src} style={{ width: `${item.width}px`, height: `${item.height}px` }} />
                    <div className={styles['image-text']}>{item.name}</div>
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
      <div className={classnames(styles.shopPageWrapper, styles.shopPageWrapperH5)}>
        <Header />
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
        <div className={styles.footerH5}>
          <Button type="primary" onClick={this.handleConfirm}>
            确定
          </Button>
        </div>
      </div>
    );
  }
}
