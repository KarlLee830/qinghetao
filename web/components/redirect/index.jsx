import React from 'react';
import Router from '@discuzqsdk/sdk/dist/router';

const noop = () => {};

/**
 * 通用 Redirect 组件，用于将 pc 和 h5 路由不同的组件进行重定向
 * @param {*} param0
 * @returns
 */
const Redirect = function ({
  jumpUrl = '',
  beforeJump = noop,
  afterJump = noop,
}) {
  React.useEffect(async () => {
    await beforeJump();

    Router.redirect({ url: jumpUrl });

    return async () => {
      await afterJump();
    };
  }, []);

  return null;
};

export default Redirect;
