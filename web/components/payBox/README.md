# 支付能力

## 使用方法
首先需要在全局预埋 payBoxProvider
```jsx
import PayBoxProvider from '../components/payBox/payBoxProvider';
<PayBoxProvider>
    <Component {...pageProps} />
</PayBoxProvider>
```

局部使用 payBox 的调用 API 拉起一个支付流程
```js
import PayBox from '../components/payBox/index';
    PayBox.createPayBox({
      data: {      // data 中传递后台参数
        amount: 0.1,
        payeeId: 59,
        title: '', // 商品名称，不同于后台参数
        threadId: 6,
        type: 3,
      },
      isAnonymous: false, // 是否匿名
      success: (orderInfo) => {}, // 支付成功回调
      failed: (orderInfo) => {}, // 支付失败回调
      completed: (orderInfo) => {} // 支付完成回调(成功或失败)
    });
```