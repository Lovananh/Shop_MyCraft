import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React from 'react';
import Home from './pages/Home';
import Header from './components/Header';
import ProductList from './pages/ProductList';

function App() {
  return React.createElement(
    Router,
    null,
    React.createElement(Header),
    React.createElement(
      Routes,
      null,
      React.createElement(Route, { path: '/', element: React.createElement(Home) }),
      React.createElement(Route, { path: '/products', element: React.createElement(ProductList) })

    )
  );
}

export default App;