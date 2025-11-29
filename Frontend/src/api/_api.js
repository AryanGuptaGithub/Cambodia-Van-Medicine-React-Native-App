// src/api/_api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://cambodia-van-medicine-react-native-app.onrender.com/api';

// Helper: axios instance with auth
const getApiClient = async () => {
    const token = await AsyncStorage.getItem('userToken');
    return axios.create({
        baseURL: BASE_URL,
        headers: {Authorization: `Bearer ${token}`}
    });
};

// ----- AUTH -----
export const login = async (email, password) => {
    const res = await axios.post(`${BASE_URL}/auth/login`, {email, password});
    const {token, user} = res.data;
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return {token, user};
};

export const register = async (data) => {
    const res = await axios.post(`${BASE_URL}/auth/register`, data);
    const {token, user} = res.data;
    await AsyncStorage.setItem('userToken', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    return {token, user};
};

// ----- CUSTOMERS -----
export const fetchCustomers = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.get(`${BASE_URL}/customers`, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return res.data;
};

export const createCustomer = async (customer) => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.post(`${BASE_URL}/customers`, customer, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return res.data;
};

// ----- PRODUCTS -----
export const fetchProducts = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.get(`${BASE_URL}/products`, {
        headers: {Authorization: `Bearer ${token}`}
    });

    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.data?.products)) return res.data.products;
    if (Array.isArray(res.data?.data)) return res.data.data;

    return [];
};

export const createProduct = async (product) => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.post(`${BASE_URL}/products`, product, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return res.data;
};

export const updateProduct = async (product) => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.put(`${BASE_URL}/products/${product.id}`, product, {
        headers: {Authorization: `Bearer ${token}`, 'Content-Type': 'application/json'}
    });
    return res.data;
};

// ----- SALES -----
export const createSale = async (sale) => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.post(`${BASE_URL}/sales`, sale, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return res.data;
};

export const fetchMySales = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.get(`${BASE_URL}/sales/my`, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return res.data.sales;
};

// ----- ZONES / PROVINCES -----
export const fetchZones = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.get(`${BASE_URL}/zones`, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return res.data;
};

export const fetchProvinces = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.get(`${BASE_URL}/provinces`, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return res.data;
};

// ----- STOCKS -----
export const addStock = async ({productId, quantity, note}) => {
    const client = await getApiClient();
    const res = await client.post('/stocks/add', {productId, quantity, note});
    return res.data;
};

export const removeStock = async ({productId, quantity, note}) => {
    const client = await getApiClient();
    const res = await client.post('/stocks/remove', {productId, quantity, note});
    return res.data;
};

export const fetchStocks = async () => {
    const client = await getApiClient();
    const res = await client.get('/stocks');
    return res.data;
};
