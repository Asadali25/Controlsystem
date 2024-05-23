import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Countdown from 'react-countdown';
import { IoSettingsOutline } from 'react-icons/io5';
import { OrderContext } from '../../OrderContext';
import './Product.css';

const Product = () => {
  const navigate = useNavigate();
  const { setCurrentOrderNumber, setCurrentSequenceNumber, currentSequenceNumber, orders } = useContext(OrderContext);
  const [sequenceNumber, setSequenceNumber] = useState(currentSequenceNumber);
  const [isPaused, setIsPaused] = useState(false);
  const location = useLocation();
  const initialOrders = location.state?.orders || orders;

  useEffect(() => {
    if (initialOrders.length > 0) {
      setCurrentSequenceNumber(sequenceNumber);
    }
  }, [initialOrders, sequenceNumber, setCurrentSequenceNumber]);

  // Group orders by sequence
  const groupedOrders = initialOrders.reduce((acc, order) => {
    if (!acc[order.sequence]) {
      acc[order.sequence] = [];
    }
    acc[order.sequence].push(order);
    return acc;
  }, {});

  // Get current sequence orders and total packing time
  const currentSequenceOrders = groupedOrders[sequenceNumber] || [];
  const totalPackingTimeSec = currentSequenceOrders.reduce((total, order) => {
    return total + parseInt(order.packing_time_sec, 10);
  }, 0);

  const [timerValue, setTimerValue] = useState(totalPackingTimeSec);

  // Effect to reset timer when sequenceNumber changes
  useEffect(() => {
    if (currentSequenceOrders.length > 0) {
      setTimerValue(totalPackingTimeSec);
      setCurrentOrderNumber(currentSequenceOrders[0].order_number);
    }
  }, [sequenceNumber, totalPackingTimeSec, currentSequenceOrders.length, setCurrentOrderNumber, currentSequenceOrders]);

  // Local storage event listener
  useEffect(() => {
    const handleStorageChange = (event) => {
      console.log('Storage event:', event);
      const newSequenceNumber = parseInt(localStorage.getItem('sequenceNumber'), 10);
      if (!isNaN(newSequenceNumber)) {
        setSequenceNumber(newSequenceNumber);
      }
      const newIsPaused = localStorage.getItem('isPaused') === 'true';
      setIsPaused(newIsPaused);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Countdown renderer
  const renderer = ({ hours, minutes, seconds, completed }) => {
    const halfTimeReached = hours * 3600 + minutes * 60 + seconds <= timerValue / 2;
    const className = halfTimeReached ? "counter half-time" : "counter";

    if (completed) {
      if (sequenceNumber < Object.keys(groupedOrders).length - 1) {
        setSequenceNumber(sequenceNumber + 1);
      }
      return <span className={className}>Packing complete!</span>;
    } else {
      return (
        <span className={className}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      );
    }
  };

  return (
    <div className="product_parent">
      <div className="container product_container" style={{ width: currentSequenceOrders.length > 4 ? "639.33px" : "940.05px" }}>
        <div className="items">
          {currentSequenceOrders.map((order, index) => (
            <div key={index} className="card card-custom item">
              <img className="card-img-top" src={order.image_url} alt="Card cap" />
              <div className="card-body">
                <h5 className="card-title">1x {order.size}</h5>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="container ins_container">
        <div className="row ins_row">
          <div className="col-lg-6 ins">
            <div className="ins_section">
              <div className="ins_header">
                <h1 className="instruction_heading">Specific instructions:</h1>
              </div>
              <div className="instruction_content">
                <span>{currentSequenceOrders[0]?.Instructions || ""}</span>
              </div>
            </div>
          </div>
          <div className="col-lg-6 timer_counter">
            <div className="next_order_section">
              <div className="next_order_heading">
                <h1 className="next_order_heading">TIME TILL NEXT ORDER</h1>
              </div>
              {!isPaused && (
                <div className={renderer.className}>
                  <Countdown date={Date.now() + timerValue * 1000} renderer={renderer} key={sequenceNumber} />
                </div>
              )}
            </div>
            {/* <div className="navigator">
              <span className="setting-icon" onClick={handleSettingsClick}><IoSettingsOutline /></span>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
