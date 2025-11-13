// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
    const [token, setToken] = useState(null);
    const [userId, setUserId] = useState(null);
    const [role, setRole] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const loadUser = () => {
            const userData = localStorage.getItem('user');
            console.log('useAuth - Đang đọc localStorage.user:', userData); // DEBUG

            if (userData) {
                try {
                    const parsed = JSON.parse(userData);
                    setToken(parsed.token);
                    setUserId(parsed.userId);
                    setRole(parsed.role);
                    console.log('useAuth - Đã load token:', parsed.token);
                } catch (err) {
                    console.error('Lỗi parse user:', err);
                    localStorage.removeItem('user');
                }
            } else {
                setToken(null);
                setUserId(null);
                setRole(null);
            }
        };

        loadUser();

        // LẮNG NGHE SỰ KIỆN localStorage THAY ĐỔI
        const handleStorageChange = (e) => {
            if (e.key === 'user') {
                console.log('useAuth - localStorage.user thay đổi:', e.newValue);
                loadUser();
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    const logout = () => {
        localStorage.removeItem('user');
        setToken(null);
        setUserId(null);
        setRole(null);
        navigate('/login');
    };

    return { token, userId, role, logout };
}