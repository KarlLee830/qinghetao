export default (params) => {
    if (process.env.DISCUZ_ENV === 'web') {
        const Storage = require('./web').default
        return new Storage(params)
    }
  
    if (process.env.DISCUZ_ENV === 'mini') {
        const Storage = require('./mini').default;
        return new Storage()
    }
}