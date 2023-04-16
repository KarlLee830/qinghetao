/**
 * 处理js计算精读的问题
 */

export const plus = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) return 0;

  let p1 = 0;
  let p2 = 0;

  if (num1.toString().split('.').length > 1) {
    p1 = num1.toString().split('.')[1].length;
  }

  if (num2.toString().split('.').length > 1) {
    p2 = num2.toString().split('.')[1].length;
  }

  const p = p1 > p2 ? p1 : p2;

  // const n1 = (num1 * Math.pow(10, p)) | 0;
  // const n2 = (num2 * Math.pow(10, p)) | 0;
  const n1 = (accMul(num1, p)) | 0;
  const n2 = (accMul(num2, p)) | 0;

  const result = (n1 + n2) / Math.pow(10, p);

  return result.toFixed(2);
};

// 含小数的数与Math.pow(10, p)相乘时会出现丢失精度现象
const accMul = (num, p) => {
  if (num.toString().split('.').length <= 1) return num * Math.pow(10, p);

  const numLength = num.toString().split('.')[1].length;
  let numberStr = num.toString();
  let result = null;

  if (p === numLength) {
      result = Number(numberStr.replace('.',''));
      return result;
  } else {
      for(let i = 0; i < p - numLength; i++) {
          numberStr += '0';
      }
      result = Number(numberStr.replace('.',''));
      return result;
  }
}

export const minus = (num1, num2) => {
  if (isNaN(num1) || isNaN(num2)) return 0;

  let p1 = 0;
  let p2 = 0;

  if (num1.toString().split('.').length > 1) {
    p1 = num1.toString().split('.')[1].length;
  }

  if (num2.toString().split('.').length > 1) {
    p2 = num2.toString().split('.')[1].length;
  }

  const p = p1 > p2 ? p1 : p2;

  const n1 = (num1 * Math.pow(10, p)) | 0;
  const n2 = (num2 * Math.pow(10, p)) | 0;

  const result = (n1 - n2) / Math.pow(10, p);

  return result.toFixed(2);
};
