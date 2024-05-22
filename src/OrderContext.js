import { createContext, useState, useEffect } from "react";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [currentOrderNumber, setCurrentOrderNumber] = useState(() => {
    return localStorage.getItem('currentOrderNumber') || null;
  });
  const [currentSequenceNumber, setCurrentSequenceNumber] = useState(() => {
    return parseInt(localStorage.getItem('currentSequenceNumber'), 10) || 0;
  });
  const [orders, setOrders] = useState(() => {
    return JSON.parse(localStorage.getItem('orders')) || [];
  });

  useEffect(() => {
    localStorage.setItem('currentOrderNumber', currentOrderNumber);
  }, [currentOrderNumber]);

  useEffect(() => {
    localStorage.setItem('currentSequenceNumber', currentSequenceNumber);
  }, [currentSequenceNumber]);

  useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  return (
    <OrderContext.Provider
      value={{
        currentOrderNumber,
        setCurrentOrderNumber,
        currentSequenceNumber,
        setCurrentSequenceNumber,
        orders,
        setOrders
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};
