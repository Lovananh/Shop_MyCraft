import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

function UploadDemo() {
    const [file, setFile] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useAuth();

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
        setMessage('');
    };

    // UploadDemo.js – SỬA handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) return;
        if (!token) {
            setMessage('Lỗi: Bạn chưa đăng nhập!');
            return;
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage(`Upload thành công: ${res.data.filename}`);
        } catch (err) {
            setMessage(`Lỗi: ${err.response?.data?.message || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <h2>Demo Upload Bảo Mật</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} accept="image/*" />
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang upload...' : 'Upload'}
                </button>
            </form>
            {message && <p style={{ marginTop: '10px', color: message.includes('thành công') ? 'green' : 'red' }}>{message}</p>}
        </div>
    );
}

export default UploadDemo;