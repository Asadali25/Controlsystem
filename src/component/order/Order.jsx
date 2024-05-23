import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderContext } from "../../OrderContext";
import "./Order.css";

function Order() {
  const navigate = useNavigate();
  const { orders, setOrders, currentSequenceNumber, setCurrentSequenceNumber, setCurrentOrderNumber, isPaused, setIsPaused } = useContext(OrderContext);

  async function fetchOrders() {
    try {
      const result = await fetch("https://sheetdb.io/api/v1/tyb2c31tf86n8", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
      });
      const response = await result.json();
      setOrders(response);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(() => {
      fetchOrders();
    }, 3600000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const currentOrder = orders.find(order => parseInt(order.sequence, 10) === currentSequenceNumber);
      if (currentOrder) {
        setCurrentOrderNumber(currentOrder.orderNumber);  // Update current order number
      }
    }
  }, [currentSequenceNumber, orders, setCurrentOrderNumber]);

  function startPause(e) {
    e.preventDefault();
    const newPausedState = !isPaused;
    setIsPaused(newPausedState);
    localStorage.setItem("isPaused", newPausedState);
    window.dispatchEvent(new Event('storage'));
  }

  function handlePreviousOrder() {
    if (currentSequenceNumber > 1) {
      const newSequenceNumber = currentSequenceNumber - 1;
      setCurrentSequenceNumber(newSequenceNumber);
      localStorage.setItem("sequenceNumber", newSequenceNumber);
      console.log("sequenceNumber", newSequenceNumber);
      window.dispatchEvent(new Event('storage'));
    }
  }

  function handleNextOrder() {
    const sequences = new Set(orders.map(order => parseInt(order.sequence, 10)));
    if (currentSequenceNumber >= Math.max(...sequences)) {
      console.log("No more orders");
      return;
    }
    const newSequenceNumber = currentSequenceNumber + 1;
    setCurrentSequenceNumber(newSequenceNumber);
    localStorage.setItem("sequenceNumber", newSequenceNumber);
    console.log("sequenceNumber", newSequenceNumber);
    window.dispatchEvent(new Event('storage'));
  }

  // Open current order(from gsheet) url in new tab
  function openUrl() {
    const obj = (orders.find(order => parseInt(order.sequence, 10) === currentSequenceNumber));
    if (obj) {
      window.open(obj.order_url, '_blank');
    }
  }

  return (
    <div className="container order_container">
      <div className="row">
        <div className="program_control">
          <button type="button" onClick={startPause}>{isPaused ? 'Start' : 'Pause'} Autoprogram</button>
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
          <button type="button" onClick={openUrl}> View Order</button>
        </div>
      </div>
    </div>
  );
}

export default Order;
