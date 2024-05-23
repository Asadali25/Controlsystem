import React, { useContext, useEffect, useState } from "react";
import { OrderContext } from "../../OrderContext";
import "./Navbar.css";

const Navbar = () => {
  const date = new Date();
  let hours = date.getHours();
  const minutes = date.getMinutes();
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
  const currentTime = hours + ":" + formattedMinutes;

  const { currentOrderNumber } = useContext(OrderContext);

  const [isPaused, setIsPaused] = useState(() => {
    return localStorage.getItem("isPaused") === "true";
  });
  const [pausedTime, setPausedTime] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsPaused(localStorage.getItem("isPaused") === "true");
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (isPaused) {
      interval = setInterval(() => {
        setPausedTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(interval);
      setPausedTime(0);
    }
    return () => clearInterval(interval);
  }, [isPaused]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <div className="navbar shadow-lg p-3 mb-5 bg-white rounded">
      <div className="navbar-left">
        <span className="time">{currentTime}</span>
      </div>
      <div className="navbar-center">
        <span className="order-number">{`ORDER #${currentOrderNumber || 'N/A'}`}</span>
      </div>
      <div className="navbar-right">
        <div className="time_heading">
          <span className="time-paused">{isPaused ? "TIME PAUSED" : "TIME RUNNING"}</span>
        </div>
        <div className="timer-box">
          <span className="paused-time">{formatTime(pausedTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
