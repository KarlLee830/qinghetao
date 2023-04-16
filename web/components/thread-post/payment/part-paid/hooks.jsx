import React, { useState, useEffect } from 'react';

const useSelectAll = ({ dataset = [], selectedData = [] } = {}) => {
  const [selectAllStatus, setSelectAllStatus] = useState(false);

  useEffect(() => {
    if (selectedData.length === 0) {
      setSelectAllStatus(false);
      return;
    }

    if (selectedData.length === dataset.length) {
      setSelectAllStatus(true);
    } else {
      setSelectAllStatus(false);
    }
  }, [dataset, selectedData]);

  const handleSelectAll = (status) => {
    if (dataset.length === 0) {
      setSelectAllStatus(false);
      return;
    }

    setSelectAllStatus(status);
  };

  return {
    selectAllStatus,
    setSelectAllStatus: handleSelectAll,
  };
};

export {
  useSelectAll
};
