import generateHooks from '../generate-hooks';

/**DZQ->plugin->register<plugin_global@footer_replace_hook>**/

export default generateHooks({
  target: 'plugin_global',
  hookNames: {
    replace: 'footer_replace_hook',
  },
});
