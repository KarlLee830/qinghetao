export const typeFilter = (data, type) => {
  let targetData = {};
  Object.keys(data).forEach((key) => {
    if (String(type) === String(key)) {
      targetData = data[key];
    }
  });

  return targetData;
};
