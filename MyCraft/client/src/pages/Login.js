// src/pages/Login.js – CHỈ THÊM THÔNG BÁO ĐẸP, GIỮ NGUYÊN 99% CODE CŨ
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { token, role, login } = useAuth();

    // Hiển thị thông báo xác thực thành công 
    useEffect(() => {
        if (searchParams.get('verified') === 'true') {
            setError(null);
            const timer = setTimeout(() => {}, 3000);
            return () => clearTimeout(timer);
        }
    }, [searchParams]);

    // Nếu đã đăng nhập → chuyển hướng ngay
    useEffect(() => {
        if (token && role) {
            console.log('Đã đăng nhập → Chuyển hướng:', role === 'admin' ? '/admin' : '/');
            navigate(role === 'admin' ? '/admin' : '/', { replace: true });
        }
    }, [token, role, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            console.log('Gửi đăng nhập:', { username, password });

            const response = await api.post('/auth/login', {
                username: username.trim(),
                password,
            });

            console.log('Response từ server:', response.data);

            const { token, role, userId, _id, name, avatar, username: serverUsername } = response.data;

            if (!token || !role) {
                throw new Error('Server không trả về token hoặc role');
            }

            login({
                token,
                role,
                userId: userId || _id,
                _id: _id || userId,
                name,
                avatar,
                username: serverUsername
            });

            console.log('ĐĂNG NHẬP THÀNH CÔNG – userId:', userId || _id);
            navigate(role === 'admin' ? '/admin' : '/', { replace: true });

        } catch (err) {
            console.error('LỖI ĐĂNG NHẬP:', err);
            const res = err.response?.data;

            // THÊM CHỈ 1 ĐOẠN NÀY: THÔNG BÁO ĐẸP KHI CHƯA XÁC THỰC
            if (res?.needsVerification) {
                setError(
                    <div style={{
                        background: '#fff8e1',
                        color: '#d97706',
                        padding: '16px',
                        borderRadius: '10px',
                        border: '2px solid #ffb74d',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        margin: '16px 0',
                        boxShadow: '0 4px 12px rgba(255, 193, 7, 0.15)'
                    }}>
                        Chưa xác thực email!<br/><br/>
                        <span style={{ fontWeight: 'normal', fontSize: '14px' }}>
                            Vui lòng kiểm tra hộp thư <strong>{'của bạn'}</strong><br/>
                            (kể cả mục <strong>Spam / Khuyến mại</strong>) để nhận link xác thực.
                        </span>
                    </div>
                );
            } else {
                setError(res?.message || err.message || 'Lỗi không xác định');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Đăng nhập</h2>

            {/* Thông báo xác thực thành công – giữ nguyên */}
            {searchParams.get('verified') === 'true' && (
                <p style={{ color: 'green', fontWeight: 'bold', textAlign: 'center' }}>
                    Email đã xác thực thành công. Bạn có thể đăng nhập ngay.
                </p>
            )}

            {/* THÔNG BÁO LỖI + THÔNG BÁO CHƯA XÁC THỰC – ĐẸP NHƯ NHAU */}
            {error && (
                <div style={{ margin: '16px 0' }}>
                    {typeof error === 'string' ? (
                        <p className="error">{error}</p>
                    ) : (
                        error
                    )}
                </div>
            )}

            {loading && <p style={{ textAlign: 'center' }}>Đang xử lý...</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tên đăng nhập:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                        placeholder="Nhập tên đăng nhập"
                    />
                </div>

                <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                        placeholder="Nhập mật khẩu"
                    />
                </div>

                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
            </form>

            <p className="forgot-link">
                <Link to="/forgot-password">Quên mật khẩu?</Link>
            </p>

            <p className="register-link">
                Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
        </div>
    );
}

export default Login;