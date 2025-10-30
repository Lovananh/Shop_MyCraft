import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

function Home() {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        let isMounted = true;

        const fetchProducts = async () => {
            setLoading(true);
            try {
                const response = await axios.get('http://localhost:5000/api/products');
                console.log('Products Response:', response.data);
                if (isMounted) {
                    setProducts(response.data || []);
                    setError(null);
                }
            } catch (err) {
                if (isMounted) {
                    setError(err.response?.data?.message || 'Lỗi khi lấy danh sách sản phẩm');
                    console.error('Fetch products error:', err.response?.data || err.message);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleBuyNow = (productId) => {
        if (!user || !user.userId) {
            navigate('/login', { state: { message: 'Vui lòng đăng nhập để mua ngay' } });
            return;
        }
        navigate('/checkout', { state: { selectedItems: [{ productId, quantity: 1 }] } });
    };

    return (
        <div className="home-container">
            {user && user.userId && (
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
            )}
            {!user && (
                <nav className="navbar">
                    <Link to="/login">Đăng nhập</Link>
                    <Link to="/register">Đăng ký</Link>
                </nav>
            )}
            <h2>Trang chủ - Sản phẩm</h2>
            {error && <p className="error">{error}</p>}
            {loading && <p>Đang tải...</p>}
            {!loading && products.length === 0 ? (
                <p>Không có sản phẩm nào</p>
            ) : (
                <div className="product-grid">
                    {products.map((product) => (
                        <div key={product._id} className="product-card">
                            <img src={product.imageUrl || 'https://place.dog/100/100'} alt={product.name} className="product-image" />
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                            <p>Giá: {product.price.toLocaleString()} VNĐ</p>
                            <p>Tồn kho: {product.stock}</p>
                            <div className="product-actions">
                                <Link to={`/product/${product._id}`} className="view-details-button">
                                    Xem chi tiết
                                </Link>
                                <button
                                    onClick={() => handleBuyNow(product._id)}
                                    disabled={product.stock === 0}
                                    className="buy-now-button"
                                >
                                    Mua ngay
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Home;