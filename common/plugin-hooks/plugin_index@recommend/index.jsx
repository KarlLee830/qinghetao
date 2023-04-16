import generateHooks from '../generate-hooks';

/**DZQ->plugin->register<plugin_index@recommend_replace_hook>**/
export default generateHooks({
  target: 'plugin_index',
  hookNames: { replace: 'recommend_replace_hook' },
});
