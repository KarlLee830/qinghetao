import generateHooks from '../generate-hooks';

/**DZQ->plugin->register<plugin_index@copyright_replace_hook>**/
export default generateHooks({
  target: 'plugin_index',
  hookNames: { replace: 'copyright_replace_hook' },
});
