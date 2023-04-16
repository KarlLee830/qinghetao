export const priceFormat = (price = 0) => {
  const targetPrice = Number(price);
  if (Number.isNaN(price)) {
    return 0.00;
  }
  return targetPrice.toFixed(2);
};
