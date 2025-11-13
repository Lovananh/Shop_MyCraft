// src/pages/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        name: '',
        address: '',
        phone: '',
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;
        setLoading(true);
        setError(null);

        // === VALIDATION ===
        if (!/^[a-z0-9.]{3,50}$/.test(formData.username)) {
            setError('Tên đăng nhập: 3-50 ký tự, chỉ a-z, 0-9, dấu chấm');
            setLoading(false);
            return;
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
            setError('Mật khẩu: ≥8 ký tự, có chữ hoa, số, ký tự đặc biệt');
            setLoading(false);
            return;
        }

        if (!/^[a-zA-ZÀ-ỹ\s]{2,100}$/.test(formData.name)) {
            setError('Họ tên: 2-100 ký tự, chỉ chữ và khoảng trắng');
            setLoading(false);
            return;
        }

        if (formData.phone && !/^(?:\+84|0)(?:3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(formData.phone)) {
            setError('Số điện thoại không hợp lệ');
            setLoading(false);
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/api/auth/register', {
                ...formData,
                role: 'user',
            });

            console.log('Register response:', response.data);

            const { token, _id: userId, role } = response.data;

            if (!token || !userId) {
                throw new Error('Server không trả token hoặc userId');
            }

            const userData = { token, userId, role: role || 'user' };
            localStorage.setItem('user', JSON.stringify(userData));
            console.log('ĐÃ LƯU USER SAU ĐĂNG KÝ:', userData);

            navigate('/products');
        } catch (err) {
            console.error('Lỗi đăng ký:', err.response?.data);
            setError(err.response?.data?.message || 'Lỗi khi đăng ký');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <h2>Đăng ký</h2>
            {error && <p className="error">{error}</p>}
            {loading && <p>Đang xử lý...</p>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Tên đăng nhập:</label>
                    <input name="username" value={formData.username} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Họ tên:</label>
                    <input name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                    <label>Địa chỉ:</label>
                    <input name="address" value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="form-group">
                    <label>Số điện thoại:</label>
                    <input name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
                <button type="submit" disabled={loading} className="submit-button">
                    {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>
            </form>

            <p className="login-link">
                Đã có tài khoản? <a href="/login">Đăng nhập</a>
            </p>
        </div>
    );
}

export default Register;