// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductList from './pages/ProductList';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Order from './pages/Order';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOrders from './pages/admin/AdminOrders';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProducts from './pages/admin/AdminProducts';
import AdminUsers from './pages/admin/AdminUsers';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Profile from './pages/Profile';
import { useAuth } from './hooks/useAuth';
import { Navigate } from 'react-router-dom';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/" element={<Home />} />
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/cancel" element={<PaymentCancel />} />

                {/* USER ROUTES */}
                <Route
                    path="/products"
                    element={<ProtectedRoute component={ProductList} requiredRole="user" />}
                />
                <Route
                    path="/cart"
                    element={<ProtectedRoute component={Cart} requiredRole="user" />}
                />
                <Route
                    path="/checkout"
                    element={<ProtectedRoute component={Checkout} requiredRole="user" />}
                />
                <Route
                    path="/orders"
                    element={<ProtectedRoute component={Order} requiredRole="user" />}
                />
                <Route
                    path="/profile"
                    element={<ProtectedRoute component={Profile} requiredRole="user" />}
                />

                {/* ADMIN ROUTES */}
                <Route
                    path="/admin"
                    element={<ProtectedRoute component={AdminLayout} requiredRole="admin" />}
                >
                    <Route index element={<AdminOverview />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="users" element={<AdminUsers />} />
                </Route>
            </Routes>
        </Router>
    );
}

// HOÀN TOÀN MỚI: DÙNG useAuth ĐỂ ĐỌNG BỘ
function ProtectedRoute({ component: Component, requiredRole }) {
    const { token, role } = useAuth();

    // Nếu token chưa load xong → chờ
    if (token === null) {
        return <div>Đang tải...</div>;
    }

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && role !== requiredRole) {
        return <Navigate to={role === 'admin' ? '/admin' : '/'} replace />;
    }

    return <Component />;
}

export default App;