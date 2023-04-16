import PluginCenterInjection from './components/PluginCenterInjection';
import PluginCenterReplaceInjection from './components/PluginCenterReplaceInjection';
import DZQPluginCenter from '@discuzqsdk/plugin-center';

export default ({ target, hookNames }) => {
  if (!target || !hookNames) return;

  const { before: beofroHookName, replace: replaceHookName, after: afterHookName } = hookNames;
  return (props) => {
    const { className = '', style = {}, component, ...others } = props;
    const replacePlugin = DZQPluginCenter.replaceInjection(target, replaceHookName);

    return (
      <>
        {/* 前插入hooks */}
        {target && beofroHookName && (
          <PluginCenterInjection
            className={className}
            style={style}
            target={target}
            hookName={beofroHookName}
            pluginProps={{
              ...others,
            }}
          />
        )}

        {/* 替换hooks */}
        {target && replaceHookName && replacePlugin ? (
          <PluginCenterReplaceInjection
            className={className}
            style={style}
            target={target}
            hookName={replaceHookName}
            pluginProps={{
              ...others,
            }}
          />
        ) : (
          component
        )}

        {/* 后插入hooks */}
        {target && afterHookName && (
          <PluginCenterInjection
            className={className}
            style={style}
            target={target}
            hookName={afterHookName}
            pluginProps={{
              ...others,
            }}
          />
        )}
      </>
    );
  };
};
