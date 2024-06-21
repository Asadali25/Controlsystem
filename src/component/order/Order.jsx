import React, { useContext, useEffect, useState } from "react";
import { OrderContext } from "../../OrderContext";
import "./Order.css";

function Order() {
  const {
    orders, setOrders, currentSequenceNumber, setCurrentSequenceNumber,
    setCurrentOrderNumber, isPaused, setIsPaused
  } = useContext(OrderContext);
  const [pausedTime, setPausedTime] = useState(() => {
    return parseInt(localStorage.getItem('pausedTime'), 10) || 0;
  });

  async function fetchOrders() {
    try {
      const response = await fetch('https://sheetdb.io/api/v1/mekxq37ux8eax');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  useEffect(() => {
    if (orders.length > 0) {
      const currentOrder = orders.find(order => parseInt(order.sequence, 10) === currentSequenceNumber);
      if (currentOrder) {
        setCurrentOrderNumber(currentOrder.orderNumber);
      }
    }
  }, [currentSequenceNumber, orders, setCurrentOrderNumber]);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsPaused(localStorage.getItem("isPaused") === "true");
      setCurrentSequenceNumber(parseInt(localStorage.getItem("sequenceNumber"), 10) || 0);
      setPausedTime(parseInt(localStorage.getItem("pausedTime"), 10) || 0);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  function startPause(e) {
    e.preventDefault();
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);

    localStorage.setItem("isPaused", newPausedState);
    window.dispatchEvent(new Event('storage'));
  }

  function handlePreviousOrder(e) {
    e.preventDefault();
    if (currentSequenceNumber > 1) {
      const newSequenceNumber = currentSequenceNumber - 1;
      setCurrentSequenceNumber(newSequenceNumber);
      localStorage.setItem("sequenceNumber", newSequenceNumber);
      window.dispatchEvent(new Event('storage'));
      localStorage.setItem('IsCompleted', true);
      window.dispatchEvent(new Event('storage'));
    }
    if (isPaused) {
      startPause(e);
    }
  }

  function handleNextOrder(e) {
    e.preventDefault();
    const sequences = new Set(orders.map(order => parseInt(order.sequence, 10)));
    if (currentSequenceNumber >= Math.max(...sequences)) {
      return;
    }
    const newSequenceNumber = currentSequenceNumber + 1;
    setCurrentSequenceNumber(newSequenceNumber);
    localStorage.setItem("sequenceNumber", newSequenceNumber);
    window.dispatchEvent(new Event('storage'));
    localStorage.setItem('IsCompleted', false);
    window.dispatchEvent(new Event('storage'));
    if (!isPaused) {
      startPause(e);
    }
  }

  function openUrl() {
    const obj = orders.find(order => parseInt(order.sequence, 10) === currentSequenceNumber);
    if (obj) {
      window.open(obj.order_url, '_blank');
    }
  }
  function skipOrder(e) {
    e.preventDefault();
    const currentOrder = orders.find(order => parseInt(order.sequence, 10) === currentSequenceNumber);
    if (!currentOrder) return;
  
    // Remove the current order from orders array
    const newOrders = orders.filter(order => parseInt(order.sequence, 10) !== currentSequenceNumber);
  
    // Update sequence numbers of remaining orders
    newOrders.forEach((order, index) => {
      order.sequence = (index + 1).toString();
    });
  
    // Add the skipped order back to the end with updated sequence number
    newOrders.push({ ...currentOrder, sequence: (newOrders.length + 1).toString() });
  
    // Update state and local storage
    setOrders(newOrders);
    localStorage.setItem('orders', JSON.stringify(newOrders));
    localStorage.setItem('orderSkipped', 'true');
    window.dispatchEvent(new Event('storage'));
  
    // Determine the correct next sequence number to display
    let newSequenceNumber = currentSequenceNumber;  
    // Set the correct sequence number
    setCurrentSequenceNumber(newSequenceNumber);
    localStorage.setItem('sequenceNumber', newSequenceNumber.toString());
    window.dispatchEvent(new Event('storage'));
  }
  

  function resetOrders(e) {
    e.preventDefault();
    localStorage.clear();
    setOrders([]);
    setCurrentSequenceNumber(1);
    setCurrentOrderNumber(null);
    setPausedTime(0);
    setIsPaused(false);
    fetchOrders();

    const event = new Event('reset');
    window.dispatchEvent(event);
    window.dispatchEvent(new Event('storage'));
  }

  return (
    <div className="container order_container">
      <div className="row">
        <div className="program_control">
          <button type="button" onClick={startPause}>{!isPaused ? 'Start' : 'Pause'} Autoprogram</button>
        </div>
      </div>

      <div className="row">
        <div className="switch_order">
          <button onClick={handlePreviousOrder}>Previous Order</button>
          <button onClick={handleNextOrder}>Next Order</button>
        </div>
      </div>
      <div className="row">
        <div className="program_control">
          <button type="button" onClick={openUrl}>View Order</button>
        </div>
      </div>
      <div className="row">
        <div className="program_control">
          <button type="button" onClick={skipOrder}>Skip This Order</button>
        </div>
        <p>Please Pause the timer before resetting the orders</p>
        <div className="program_control">
          <button type="button" onClick={resetOrders}>Reset Orders</button>
        </div>
      </div>
    </div>
  );
}

export default Order;
