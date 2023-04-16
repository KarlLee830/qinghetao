import generateHooks from '../generate-hooks';

/**DZQ->plugin->register<plugin_index@header_replace_hook,header_insert_before_hook,header_insert_after_hook>**/

export default generateHooks({
  target: 'plugin_index',
  hookNames: {
    before: 'header_insert_before_hook',
    replace: 'header_replace_hook',
    after: 'header_insert_after_hook',
  },
});
