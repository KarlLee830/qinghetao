import generateHooks from '../generate-hooks';

/**DZQ->plugin->register<plugin_global@header_replace_hook>**/
export default generateHooks({
  target: 'plugin_global',
  hookNames: {
    replace: 'header_replace_hook',
  },
});
