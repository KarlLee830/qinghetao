import generateHooks from '../generate-hooks';

/**DZQ->plugin->register<plugin_index@topping_replace_hook,topping_insert_before_hook,topping_insert_after_hook>**/
export default generateHooks({
  target: 'plugin_index',
  hookNames: {
    before: 'topping_insert_before_hook',
    replace: 'topping_replace_hook',
    after: 'topping_insert_after_hook',
  },
});
