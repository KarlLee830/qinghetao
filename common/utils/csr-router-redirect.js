import Router from '@discuzqsdk/sdk/dist/router';
import typeofFn from '@common/utils/typeof';

export default function csrRouterRedirect() {

    if (process.env.DISCUZ_RUN === 'static') {
        let routerMap = process.env.ROUTER_MAP;
        if ( typeofFn.isString(routerMap) ) {
          routerMap = JSON.parse(routerMap);
        }

        // // 当CSR出现末尾是index，会导致不能正确跳转的问题；
        let { pathname } = window.location;
        const isIndex = pathname === '/' || pathname.indexOf('/cate/') > -1;
        if (pathname !== '' && !isIndex) {
          const pathnameArr = pathname.split('/');
          if (pathnameArr[pathnameArr.length - 1] === 'index') {
            pathnameArr.pop();
            pathname = pathnameArr.join('/');
          }
        }

        // 如果是首页不处理
        if ( pathname === '' || isIndex) {
            return;
        }

        const pathArr = pathname.split('/').map((item, key) => {
            if (item !== '') return item;
        });
        let curr = routerMap;
        let res = [];
        for ( let i = 0; i < pathArr.length; i++ ) {
            if ( !pathArr[i]) continue;

            if ( curr[pathArr[i]] ) {
                res.push(pathArr[i]);

                // 如果已经去到最后一个分段，但是map中依然有，需要看是否存在*，解决「id】类型的路由缺少对应id的路由导致死循环的问题
                curr = curr[pathArr[i]];
            // 没有找到是否存在是动态路由
            } else {
                if ( curr['*'] && i == pathArr.length - 1 ) {
                    res.push(pathArr[i]);
                    curr = curr[pathArr[i]];
                } else {
                    Router.redirect({ url: `/404` });
                    return;
                }
            }
        }

        if (curr && curr['*']) {
            Router.redirect({ url: '/404' });
            return;
        }

        Router.redirect({ url: `/${res.join('/')}${window.location.search}` });
    }
}