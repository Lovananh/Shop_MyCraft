import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import '../assets/styles/forgotpassword.css';

function ResetPassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [emailLocked, setEmailLocked] = useState(false);
    const [token, setToken] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const qEmail = searchParams.get('email');
        const qToken = searchParams.get('token');
        if (qEmail) {
            setEmail(qEmail);
            setEmailLocked(true);
        }
        if (qToken) setToken(qToken);

        // Remove sensitive query params from the address bar (no reload)
        if (qEmail || qToken) {
            try {
                const pathname = window.location.pathname || '/reset-password';
                // replace current entry with cleaned URL
                navigate(pathname, { replace: true });
            } catch (navErr) {
                console.error('Error clearing reset query params', navErr);
            }
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);
        if (newPassword !== confirm) return setError('Mật khẩu mới và xác nhận không khớp');
        setLoading(true);
        try {
            const payload = { email: email.trim(), newPassword };
            if (token) payload.token = token;
            if (code) payload.code = code.trim();

            const resp = await axios.post('http://localhost:5000/api/auth/reset-password', payload);
            setMessage(resp.data?.message || 'Đã đặt lại mật khẩu');
            // redirect to login after short delay
            setTimeout(() => navigate('/login?reset=true', { replace: true }), 1500);
        } catch (err) {
            console.error('Reset error', err);
            setError(err.response?.data?.message || err.message || 'Lỗi khi đặt lại mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-outer">
            <div className="auth-card reset-card">
                <h2>Đặt lại mật khẩu</h2>
                <p>Nhập email và mã hoặc dùng liên kết từ email để đặt mật khẩu mới.</p>

                {message && <p className="success">{message}</p>}
                {error && <p className="error">{error}</p>}

                <form onSubmit={handleSubmit} className="auth-form reset-form">
                    <div className="form-group">
                        <label>Email:</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required readOnly={emailLocked} />
                        {emailLocked && <small style={{ display: 'block', marginTop: 6, color: '#666' }}></small>}
                    </div>

                    <div className="form-group">
                        <label>Mã đặt lại (nếu có):</label>
                        <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
                    </div>

                    {/* hidden token keeps token in payload but not shown in UI */}
                    <input type="hidden" value={token} />

                    <div className="form-group">
                        <label>Mật khẩu mới:</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    </div>

                    <div className="form-group">
                        <label>Xác nhận mật khẩu:</label>
                        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                    </div>

                    <button type="submit" disabled={loading} className="submit-button">
                        {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </button>
                </form>
                <p className="forgot-link" style={{ marginTop: 12 }}>
                    <Link to="/login"> Quay lại đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}

export default ResetPassword;
