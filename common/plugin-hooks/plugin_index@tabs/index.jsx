import generateHooks from '../generate-hooks';

/**DZQ->plugin->register<plugin_index@tabs_replace_hook>**/

export default generateHooks({
  target: 'plugin_index',
  hookNames: {
    replace: 'tabs_replace_hook'
  }
});
