import generateHooks from '../generate-hooks';

/**DZQ->plugin->register<plugin_index@left_replace_hook>**/
export default generateHooks({
  target: 'plugin_index',
  hookNames: {
    replace: 'left_replace_hook',
  },
});
