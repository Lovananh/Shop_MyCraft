// src/pages/Profile.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../assets/styles/profile.css'
function Profile() {
    const [userInfo, setUserInfo] = useState({
        username: '',
        name: '',
        address: '',
        phone: '',
        avatar: 'https://place.dog/100/100',
    });
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef(null);

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (!user?.userId) {
            navigate('/login');
            return;
        }
        fetchUserProfile();
    }, [navigate, user?.userId]);

    const fetchUserProfile = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/profile', {
                headers: { 'user-id': user.userId },
            });
            console.log('DỮ LIỆU PROFILE:', res.data)
            setUserInfo(res.data);
        } catch (err) {
            setError('Không thể tải thông tin');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        if (!/^[a-zA-ZÀ-ỹ\s]{2,100}$/.test(userInfo.name)) {
            setError('Tên không hợp lệ');
            return;
        }
        if (userInfo.phone && !/^(?:\+84|0)(?:3[2-9]|5[689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}$/.test(userInfo.phone)) {
            setError('SĐT không hợp lệ');
            return;
        }

        setLoading(true);
        try {
            await axios.put('http://localhost:5000/api/profile', {
                // XÓA DÒNG NÀY → username không được cập nhật
                // username: user.username,
                name: userInfo.name,
                address: userInfo.address,
                phone: userInfo.phone,
            }, {
                headers: { 'user-id': user.userId },
            });

            // CẬP NHẬT LẠI userInfo từ server
            await fetchUserProfile(); // TẢI LẠI DỮ LIỆU MỚI

            setSuccess('Cập nhật thành công!');
            setIsEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        setLoading(true);
        try {
            const res = await axios.post('http://localhost:5000/api/profile/avatar', formData, {
               headers: { 'user-id': user.userId }
            });
            console.log('AVATAR MỚI:', res.data.avatar);
            setUserInfo(prev => ({ ...prev, avatar: res.data.avatar + '?t=' + Date.now() })); // cache busting
            setSuccess('Cập nhật ảnh đại diện thành công!');
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi upload ảnh');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-wrapper">
            <nav className="navbar">
                <div className="container">
                    <Link to="/products">Sản phẩm</Link>
                    <Link to="/cart">Giỏ hàng</Link>
                    <Link to="/orders">Đơn hàng</Link>
                    
                    <button onClick={() => {
                        localStorage.removeItem('user');
                        navigate('/login');
                    }}>Đăng xuất</button>
                    <Link to="/profile">Cá nhân</Link>
                </div>
            </nav>

            <div className="page-content">
                <div className="profile-container">
                    {/* <button onClick={() => navigate(-1)} className="back-button">Quay lại</button> */}
                    <h2>Thông tin cá nhân</h2>

                    {error && <p className="error">{error}</p>}
                    {success && <p className="success">{success}</p>}
                    {loading && <p>Đang xử lý...</p>}

                    <div className="profile-avatar-section">
                        <img
                            src={userInfo.avatar}
                            alt="Avatar"
                            className="profile-avatar"
                            onError={(e) => { e.target.src = 'https://place.dog/100/100'; }}
                        />
                        {isEditing && (
                            <div className="avatar-upload">
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    style={{ display: 'none' }}
                                    onChange={handleAvatarChange}
                                />
                                <button
                                    onClick={() => fileInputRef.current.click()}
                                    className="change-avatar-btn"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang tải...' : 'Đổi ảnh'}
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="profile-info">
                        <div className="info-group">
                            <label>Tên đăng nhập:</label>
                            <p><strong>{userInfo.username || 'Chưa có'}</strong></p>
                        </div>

                        {isEditing ? (
                            <>
                                <div className="info-group">
                                    <label>Họ tên:</label>
                                    <input name="name" value={userInfo.name} onChange={handleInputChange} />
                                </div>
                                <div className="info-group">
                                    <label>SĐT:</label>
                                    <input name="phone" value={userInfo.phone} onChange={handleInputChange} />
                                </div>
                                <div className="info-group">
                                    <label>Địa chỉ:</label>
                                    <textarea name="address" value={userInfo.address} onChange={handleInputChange} rows="3" />
                                </div>
                                <div className="profile-actions">
                                    <button onClick={handleSave} disabled={loading} className="save-btn">
                                        {loading ? 'Đang lưu...' : 'Lưu'}
                                    </button>
                                    <button onClick={() => setIsEditing(false)} className="cancel-btn">Hủy</button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="info-group">
                                    <label>Họ tên:</label>
                                    <p>{userInfo.name || 'Chưa cập nhật'}</p>
                                </div>
                                <div className="info-group">
                                    <label>SĐT:</label>
                                    <p>{userInfo.phone || 'Chưa có'}</p>
                                </div>
                                <div className="info-group">
                                    <label>Địa chỉ:</label>
                                    <p>{userInfo.address || 'Chưa có'}</p>
                                </div>
                                <button onClick={() => setIsEditing(true)} className="edit-btn">
                                    Chỉnh sửa
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;