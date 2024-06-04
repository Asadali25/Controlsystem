import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { OrderContext } from "../../OrderContext";
import "./Order.css";

function Order() {
  const navigate = useNavigate();
  const {
    orders, setOrders, currentSequenceNumber, setCurrentSequenceNumber,
    setCurrentOrderNumber, isPaused, setIsPaused
  } = useContext(OrderContext);
  const [pausedTime, setPausedTime] = useState(() => {
    return parseInt(localStorage.getItem('pausedTime'), 10) || 0;
  });
  const [pauseStartTime, setPauseStartTime] = useState(null);

  async function fetchOrders() {
    try {
      const response = await fetch('https://sheetdb.io/api/v1/u66ayocxppnxt');
      const data = await response.json();
      setOrders(data);
      console.log("orders", data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  }

  useEffect(() => {
    fetchOrders();

    const interval = setInterval(fetchOrders, 360000); // Fetch orders every 6 minutes

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (orders.length > 0) {
      const currentOrder = orders.find(order => parseInt(order.sequence, 10) === currentSequenceNumber);
      if (currentOrder) {
        setCurrentOrderNumber(currentOrder.orderNumber);
      }
    }
  }, [currentSequenceNumber, orders, setCurrentOrderNumber]);

  useEffect(() => {
    let interval;
    if (isPaused) {
      setPauseStartTime(Date.now());
      clearInterval(interval);
    } else {
      if (pauseStartTime) {
        const pausedDuration = Math.floor((Date.now() - pauseStartTime) / 1000);
        setPausedTime(prevTime => prevTime + pausedDuration);
        localStorage.setItem('pausedTime', pausedTime + pausedDuration);
        setPauseStartTime(null);
      }
      interval = setInterval(() => {
        setPausedTime(prevTime => {
          const newTime = prevTime + 1;
          localStorage.setItem('pausedTime', newTime);
          return newTime;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isPaused, pauseStartTime]);

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
      console.log("sequenceNumber", newSequenceNumber);
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
      console.log("No more orders");
      return;
    }
    const newSequenceNumber = currentSequenceNumber + 1;
    setCurrentSequenceNumber(newSequenceNumber);
    localStorage.setItem("sequenceNumber", newSequenceNumber);
    console.log("sequenceNumber", newSequenceNumber);
    window.dispatchEvent(new Event('storage'));
    localStorage.setItem('IsCompleted', false);
    window.dispatchEvent(new Event('storage'));
    if (!isPaused) {
      startPause(e);
    }
  }

  // Open current order URL in new tab
  function openUrl() {
    const obj = orders.find(order => parseInt(order.sequence, 10) === currentSequenceNumber);
    if (obj) {
      window.open(obj.order_url, '_blank');
    }
  }

  return (
    <div className="container order_container">
      <div className="row">
        <div className="program_control">
          <button type="button" onClick={startPause}>{!isPaused ? 'Pause' : 'Start'} Autoprogram</button>
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
    </div>
  );
}

export default Order;