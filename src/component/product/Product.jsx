import React, { useEffect, useState, useContext } from 'react';
import Countdown from 'react-countdown';
import { IoSettingsOutline } from 'react-icons/io5';
import { OrderContext } from '../../OrderContext';
import './Product.css';

const Product = () => {
  const [packedDone, setPackedDone] = useState(false);
  const { setCurrentOrderNumber, setCurrentSequenceNumber, currentSequenceNumber, orders, isPaused, setIsPaused } = useContext(OrderContext);
  const [sequenceNumber, setSequenceNumber] = useState(currentSequenceNumber);
  const [backgroundColor, setBackgroundColor] = useState('white');

  useEffect(() => {
    if (orders.length > 0) {
      setCurrentSequenceNumber(sequenceNumber);
    }
  }, [orders, sequenceNumber, setCurrentSequenceNumber]);

  const groupedOrders = orders.reduce((acc, order) => {
    if (!acc[order.sequence]) {
      acc[order.sequence] = [];
    }
    acc[order.sequence].push(order);
    return acc;
  }, {});

  const currentSequenceOrders = groupedOrders[sequenceNumber] || [];
  const totalPackingTimeSec = currentSequenceOrders.reduce((total, order) => {
    return total + parseInt(order.packing_time_sec, 10);
  }, 0);

  const [timerValue, setTimerValue] = useState(totalPackingTimeSec);

  useEffect(() => {
    if (currentSequenceOrders.length > 0) {
      setTimerValue(totalPackingTimeSec);
      setCurrentOrderNumber(currentSequenceOrders[0].order_number);
    }
  }, [sequenceNumber, totalPackingTimeSec, currentSequenceOrders.length, setCurrentOrderNumber, currentSequenceOrders]);

  useEffect(() => {
    const handleStorageChange = (event) => {
      const IsCompleted = localStorage.getItem('IsCompleted') === 'true';
      if (IsCompleted) {
        setPackedDone(true);
      } else {
        setPackedDone(false);
      }

      const newSequenceNumber = parseInt(localStorage.getItem('sequenceNumber'), 10);
      if (!isNaN(newSequenceNumber)) {
        setSequenceNumber(newSequenceNumber);
      }
      const newIsPaused = localStorage.getItem('isPaused') === 'true';
      setIsPaused(newIsPaused);

      if (localStorage.getItem('orderSkipped') === 'true') {
        localStorage.removeItem('orderSkipped');
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [setIsPaused, setSequenceNumber, setPackedDone]);

  const renderer = ({ minutes, seconds, completed }) => {
    const halfTimeReached = minutes * 60 + seconds <= timerValue / 2;
    const className = halfTimeReached ? "counter half-time" : "counter";

    if (completed) {
      setBackgroundColor('#dafedabb');
      setTimeout(() => {
        const sequences = Object.keys(groupedOrders).map(key => parseInt(key, 10));
        const maxSequence = Math.max(...sequences);
        if (sequenceNumber < maxSequence) {
          const newSequenceNumber = sequenceNumber + 1;
          setSequenceNumber(newSequenceNumber);
          setCurrentSequenceNumber(newSequenceNumber);
          localStorage.setItem('sequenceNumber', newSequenceNumber);
          localStorage.setItem('IsCompleted', 'false');
          window.dispatchEvent(new Event('storage'));
        }
        setBackgroundColor('white');
        setPackedDone(true);
        localStorage.setItem('IsCompleted', 'false');
        window.dispatchEvent(new Event('storage'));
      }, 5000);
    } else {
      return (
        <span className={className}>
          {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </span>
      );
    }
  };

  function handleSettingsClick() {
    window.open('/control', '_blank');
  }

  return (
    <div className={`product_parent `} style={{ backgroundColor: backgroundColor }}>
      {packedDone && (
        <div className="settings_icon alreadyPacked">
          Already Packed
        </div>
      )}
      <div className="container product_container">
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
          {currentSequenceOrders[0]?.Instructions && (
            <div className="col-lg-6 ins">
              <div className="ins_section">
                <div className="ins_header">
                  <h1 className="instruction_heading">Specific instructions:</h1>
                </div>
                <div className="instruction_content">
                  <span>{currentSequenceOrders[0]?.Instructions}</span>
                </div>
              </div>
            </div>
          )}
          <div className="col-lg-6 timer_counter">
            <div className="next_order_section">
              <div className="next_order_heading">
                <h1 className={`next_order_heading `}>TIME TILL NEXT ORDER</h1>
              </div>
              {isPaused && (
                <div className={`${renderer.className}`}>
                  {backgroundColor === "white" ? (
                    <Countdown date={Date.now() + timerValue * 1000} renderer={renderer} key={sequenceNumber} />
                  ) : (
                    <>
                      <p style={{ color: "black", fontSize: "20px", fontWeight: "bold", border: "1px solid black", padding: "10px", borderRadius: "10px" }}>Packing Done! Next Order in 5 seconds</p>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="navigator">
              <span className="setting-icon" onClick={handleSettingsClick}><IoSettingsOutline /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;
