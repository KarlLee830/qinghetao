export const numberFormat = (number = 0) => {
  let targetNumber = Number(number);
  if (Number.isNaN(number)) {
    targetNumber = 0;
  }
  if (targetNumber < 10000) {
    return targetNumber;
  }
  if (Number.isInteger(number)) {
    return `${(number / 10000).toFixed(1)}W`;
  }
  return `${(number / 10000).toFixed(1)}W`;
};
