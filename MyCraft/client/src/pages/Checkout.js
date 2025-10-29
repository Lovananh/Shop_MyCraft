import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import './Checkout.css';

function Checkout() {
    const [orderItems, setOrderItems] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const selectedItems = location.state?.selectedItems || [];

    useEffect(() => {
        if (!user || !user.userId) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để thanh toán' } });
            return;
        }

        let isMounted = true;

        const fetchOrderItems = async () => {
            if (selectedItems.length === 0) {
                setError('Không có sản phẩm nào để thanh toán');
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const response = await axios.post(
                    'http://localhost:5000/api/cart/selected',
                    { selectedItems },
                    { headers: { 'user-id': user.userId } }
                );
                console.log('Order Items Response:', response.data);
                if (isMounted) {
                    setOrderItems(response.data.items || []);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Lỗi khi lấy thông tin thanh toán');
                    console.error('Fetch order items error:', err.response?.data || err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchOrderItems();

        return () => {
            isMounted = false;
        };
    }, [navigate, user?.userId, selectedItems]);

    const totalPrice = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const handlePlaceOrder = async () => {
        if (orderItems.length === 0) {
            setError('Không có sản phẩm nào để thanh toán');
            return;
        }

        try {
            await axios.post(
                'http://localhost:5000/api/orders',
                { items: orderItems },
                { headers: { 'user-id': user.userId } }
            );
            // Xóa các sản phẩm đã thanh toán khỏi giỏ hàng
            await axios.post(
                'http://localhost:5000/api/cart/remove-selected',
                { selectedItems },
                { headers: { 'user-id': user.userId } }
            );
            alert('Đặt hàng thành công!');
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi khi đặt hàng');
            console.error('Place order error:', err.response?.data || err.message);
        }
    };

    return (
        <div className="checkout-container">
            <nav className="navbar">
                <Link to="/products">Sản phẩm</Link>
                <Link to="/cart">Giỏ hàng</Link>
                <button onClick={() => {
                    if (window.confirm('Bạn có chắc muốn đăng xuất?')) {
                        localStorage.removeItem('user');
                        navigate('/login');
                    }
                }}>Đăng xuất</button>
            </nav>
            <button onClick={() => navigate(-1)} className="back-button">Quay lại</button>
            <h2>Thanh toán</h2>
            {error && <p className="error">{error}</p>}
            {loading && <p>Đang tải...</p>}
            {!loading && orderItems.length === 0 ? (
                <p>Không có sản phẩm nào để thanh toán</p>
            ) : (
                <div>
                    <table className="checkout-table">
                        <thead>
                            <tr>
                                <th>Hình ảnh</th>
                                <th>Sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Giá</th>
                                <th>Tổng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orderItems.map((item) => (
                                <tr key={item.productId}>
                                    <td>
                                        <img
                                            src={item.imageUrl || 'https://place.dog/100/100'}
                                            alt={item.name}
                                            className="checkout-image"
                                        />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                    <td>{item.price.toLocaleString()} VNĐ</td>
                                    <td>{(item.price * item.quantity).toLocaleString()} VNĐ</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p>Tổng tiền: {totalPrice.toLocaleString()} VNĐ</p>
                    <button onClick={handlePlaceOrder} className="place-order-button">
                        Đặt hàng
                    </button>
                </div>
            )}
        </div>
    );
}

export default Checkout;