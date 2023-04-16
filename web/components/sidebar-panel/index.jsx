import React, { useMemo } from 'react';
import SectionTitle from '@components/section-title';
import BottomView from '@components/list/BottomView';
import styles from './index.module.scss';
import classNames from 'classnames';

/**
 * PC端，右侧边栏面板组件（容器）
 * @prop {function} noData 是否出现无数据页面
 * @prop {function} isLoading 是否出现加载数据页面
 * @prop {function} isNeedBottom 是否需要底部间距
 * @prop {'wrapper' | 'plane'} mold 需不需要padding包裹children
 */

const Index = (props) => {
  const { mold = 'wrapper' } = props
  return mold === 'wrapper' ? <WrapperContent {...props} /> : <PlaneContent {...props} />;
};

const WrapperContent = (props) => {
  const {
    noData = true,
    isLoading = false,
    children,
    footer = null,
    header = null,
    type = 'small',
    className = '',
    platform = 'pc',
    isNeedBottom = true,
    errorText = '',
    isError = false,
    messageMode = false,
  } = props;

  const isNoData = useMemo(() => !children || !!noData, [noData, children]);

  const pcStyle = useMemo(() => {
    if (platform === 'pc') {
      const width = type === 'small' ? styles.small : type === 'large' ? styles.large : styles.normal;
      return `${styles.containerPC} ${width}`;
    }
    return styles.containerH5;
  }, [platform, type]);

  return (
    <div className={classNames(styles.container, pcStyle, className, {
      [styles.bottom]: isNeedBottom,
      [styles['clear-padding']]: messageMode,
    })}>
      {header || <SectionTitle bigSize={type === 'small' ? false : platform === 'pc'} titleStyle={messageMode ? { margin: '0 16px' } : {}} {...props} />}
      {(!isLoading && !isNoData) ? children : <BottomView isError={isError} errorText={errorText} noMore={!isLoading && isNoData} loadingText='正在加载' />}
      {footer}
    </div>
  )
}

const PlaneContent = (props) => {
  const {
    noData = true,
    isLoading = false,
    children,
    header = null,
    type = 'small',
    className = '',
    platform = 'pc',
    titleWrapper = '',
    errorText = '',
    isError = false
  } = props;
  const isNoData = useMemo(() => !children || !!noData, [noData, children]);

  const pcStyle = useMemo(() => {
    if (platform === 'pc') {
      const width = type === 'small' ? styles.small : type === 'large' ? styles.large : styles.normal;
      return `${styles.containerPC} ${width}`;
    }
    return styles.containerH5;
  }, [platform, type]);
  return (
    <div className={className}>
      <div className={`${pcStyle} ${styles.containerPlane} ${titleWrapper}`}>
        {header || <SectionTitle bigSize={type === 'small' ? false : platform === 'pc'} {...props} />}
      </div>
      {(!isLoading && !isNoData) ? children : <BottomView className={styles.bottomView} isError={isError} errorText={errorText} noMore={!isLoading && isNoData} loadingText='正在加载' />}
    </div>
  )
}

export default React.memo(Index);
