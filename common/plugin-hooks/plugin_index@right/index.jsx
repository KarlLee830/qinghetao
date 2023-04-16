import generateHooks from '../generate-hooks';

/**DZQ->plugin->register<plugin_index@right_replace_hook>**/
export default generateHooks({
  target: 'plugin_index',
  hookNames: {
    replace: 'right_replace_hook'
  }
});
