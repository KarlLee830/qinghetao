import {version} from '../../package.json';
export default {
    dsn: 'https://148faceea8c84ee4a465d3217652d8e3@report.url.cn/sentry/3194',
    release: version,
    debug: process.env.NODE_ENV === 'production' ? false : true,
    environment: process.env.NODE_ENV === 'production' ? 'prod' : 'dev',
    transportOptions: {
        fetchParameters: {
          mode: 'no-cors'
        }
    }
}