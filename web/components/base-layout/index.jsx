import React, { forwardRef, useEffect, useLayoutEffect } from 'react';
import BaseLayoutControl from './control';

const BaseLayout = forwardRef((props, ref) => {
  return <BaseLayoutControl {...props} ref={ref} />;
});

export default BaseLayout;
