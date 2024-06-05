import './App.css';
import Navbar from './component/navbar/Navbar';
import Product from './component/product/Product';
import Order from './component/order/Order';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React, { useState } from 'react';

function App() {
  const [pausedTime, setPausedTime] = useState(0);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar pausedTime={pausedTime} />
        <Routes>
          <Route path="/" element={<Product setPausedTime={setPausedTime} />} />
          <Route path="/control" element={<Order />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
