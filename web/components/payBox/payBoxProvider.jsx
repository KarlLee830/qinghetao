import React, { createContext, useContext } from 'react';
import PayBox from '../payBox';

const PayBoxComponentContext = createContext(null);

export default function PayBoxProvider({ children }) {
  const parentContext = useContext(PayBoxComponentContext);

  return (
      <PayBoxComponentContext.Provider value={{}}>
        {children}
        {!parentContext && (
          <>
            <PayBox />
          </>
        )}
      </PayBoxComponentContext.Provider>
  );
}
