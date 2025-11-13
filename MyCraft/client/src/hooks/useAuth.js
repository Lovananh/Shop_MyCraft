import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        navigate('/login');
    };

    return { token, role, logout };
};