import typeofFn from './typeof';

const backtoTop = (scrollTop, callback) => {
  let step = scrollTop > 30000 ? 0 : scrollTop > 5000 ? 6 : 12;
  const count = 8;
  function fn() {
    if (step === 0) {
      scrollTop = 0;
      if (typeofFn.isFunction(callback)) callback(scrollTop);
    } else if (step > 0) {
      const top = scrollTop - (scrollTop / count);
      scrollTop = top;
      if (typeofFn.isFunction(callback)) callback(scrollTop);
      window.requestAnimationFrame(fn);
    }
    step -= 1;
  }
  fn();
};

export default backtoTop;
