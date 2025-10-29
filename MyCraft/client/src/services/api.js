import axios from 'axios'

const API_URL = 'http://localhost:5000/api';

export const getProducts = async () => {
    const res = await axios.get(`${API_URL}/products`);
    return res.data;
};

export const getProductById = async (id) => {
    const res = await axios.get(`${API_URL}/products/${id}`);
    return res.data;
}