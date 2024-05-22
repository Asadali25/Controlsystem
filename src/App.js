import './App.css';
import Navbar from './component/navbar/Navbar';
import Product from './component/product/Product';
import Order from './component/order/Order';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { OrderProvider } from './OrderContext'; // Import the context
import React,{useState} from 'react';

function App() {
  const [pausedTime, setPausedTime] = useState(0);

  return (
    <OrderProvider>
      <div className="App">
        <BrowserRouter>
          <Navbar pausedTime={pausedTime}/>
          <Routes>
            <Route path="/product" element={<Product setPausedTime={setPausedTime}/>} />
            <Route path="/" element={<Order/>} />
          </Routes>
        </BrowserRouter>
      </div>
    </OrderProvider>
  );
}

export default App;