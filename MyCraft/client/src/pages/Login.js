// src/pages/Login.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { token, role } = useAuth();

    useEffect(() => {
        if (token) {
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

            const response = await axios.post('http://localhost:5000/api/auth/login', {
                username: username.trim(),
                password,
            });

            console.log('Response từ server:', response.data);

            const { token, role } = response.data;

            if (!token || !role) {
                throw new Error('Server không trả về token hoặc role');
            }

            // LƯU CHỈ token + role
            const userData = { token, role };
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('ĐÃ LƯU USER VÀO localStorage:', userData);

            navigate(role === 'admin' ? '/admin' : '/', { replace: true });

        } catch (err) {
            console.error('LỖI ĐĂNG NHẬP:', err);
            const message = err.response?.data?.message || err.message || 'Lỗi không xác định';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <h2>Đăng nhập</h2>
            {error && <p className="error">{error}</p>}
            {loading && <p>Đang xử lý...</p>}

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

            <p className="register-link">
                Chưa có tài khoản? <a href="/register">Đăng ký ngay</a>
            </p>
        </div>
    );
}

export default Login;