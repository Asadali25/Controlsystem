import React, { useContext, useState, useRef, useEffect } from "react";
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

  const { currentOrderNumber, isPaused, setIsPaused } = useContext(OrderContext);

  const [pausedTime, setPausedTime] = useState(() => {
    const savedPausedTime = localStorage.getItem("pausedTime");
    return savedPausedTime ? parseInt(savedPausedTime, 10) : 0;
  });

  const intervalRef = useRef(null);

  const handleStorageChange = () => {
    setIsPaused(localStorage.getItem("isPaused") === "true");
    const savedPausedTime = localStorage.getItem("pausedTime");
    if (savedPausedTime) {
      setPausedTime(parseInt(savedPausedTime, 10));
    }
  };

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);

    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    } else {
      intervalRef.current = setInterval(() => {
        setPausedTime(prevTime => {
          
          const newTime = prevTime + 1;
          localStorage.setItem("pausedTime", newTime);
          console.log(newTime)
          return newTime;
        });
      }, 1000);
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
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
          <span className="time-paused">{!isPaused ? "TIME Running" : "TIME Paused"}</span>
        </div>
        <div className="timer-box">
          <span className="paused-time">{formatTime(pausedTime)}</span>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
