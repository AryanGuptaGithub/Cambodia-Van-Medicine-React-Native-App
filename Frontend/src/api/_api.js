// ------------------------------- Backend Synced API --------------------------------------
// src/api/_api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


// Render added backend link
const BASE_URL = 'https://cambodia-van-medicine-react-native-app.onrender.com/api';

//  // testing Base_URL
// const BASE_URL = 'https://sprightlier-deepwater-tanisha.ngrok-free.dev/api'; // replace with your backend URL

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

    // always return an array
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

// _api.js
export const updateProduct = async (product) => {
    return fetch(`${BASE_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(product)
    }).then(res => res.json());
};


// ----- SALES -----
export const createSale = async (sale) => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.post(`${BASE_URL}/sales`, sale, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return res.data;
};

export const fetchZones = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.get(`${BASE_URL}/zones`, {headers: {Authorization: `Bearer ${token}`}});
    return res.data; // returns ["Zone A", "Zone B", ...]
};
export const fetchProvinces = async () => {
    const token = await AsyncStorage.getItem('userToken');
    const res = await axios.get(`${BASE_URL}/provinces`, {headers: {Authorization: `Bearer ${token}`}});
    return res.data; // returns ["Phnom Penh", "Battambang", ...]
};

export const fetchMySales = async () => {
    const token = await AsyncStorage.getItem('userToken');
    console.log('Token before fetching sales:', token); // <-- debug
    const res = await axios.get(`${BASE_URL}/sales/my`, {
        headers: {Authorization: `Bearer ${token}`}
    });
    return res.data.sales;
};



