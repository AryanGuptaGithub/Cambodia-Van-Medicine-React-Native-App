// // src/api/_api.js
// // Replace baseUrl and functions to match your backend API (MongoDB + Express etc).
// // const baseUrl = 'https://your-backend.example.com/api'; // <- replace
// //
// // export async function fetchCustomers() {
// //     // try {
// //     //     const res = await fetch(`${baseUrl}/customers`);
// //     //     if (!res.ok) throw new Error('fetchCustomers failed');
// //     //     return res.json();
// //     // } catch (err) {
// //     //     console.log('fetchCustomers', err.message);
// //     //     return null;
// //     // }
// //
// // //this is a dummy return
// //     return [
// //         {id: 1, name: 'John Doe', address: '123 Main St'},
// //         {id: 2, name: 'Jane Smith', address: '456 Market St'},
// //     ]
// //
// // }
// //
// // export async function fetchProducts() {
// //     // try {
// //     //     const res = await fetch(`${baseUrl}/products`);
// //     //     if (!res.ok) throw new Error('fetchProducts failed');
// //     //     return res.json();
// //     // } catch (err) {
// //     //     console.log('fetchProducts', err.message);
// //     //     return null;
// //     // }
// //
// //     //this is a dummy return
// //     return [
// //         {id: 1, name: 'Product A', price: 10},
// //         {id: 2, name: 'Product B', price: 20},
// //     ];
// // }
// //
// // export async function createCustomer(customer) {
// //     // try {
// //     //     const res = await fetch(`${baseUrl}/customers`, {
// //     //         method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(customer)
// //     //     });
// //     //     if (!res.ok) throw new Error('createCustomer failed');
// //     //     return res.json();
// //     // } catch (err) {
// //     //     console.log('createCustomer', err.message);
// //     //     throw err;
// //     // }
// //
// //     //this is a dummy return
// //     // Just simulate successful creation
// //     console.log('createCustomer called', customer);
// //     return {...customer, id: Date.now()};
// //
// // }
// //
// // export async function createProduct(product) {
// //     // try {
// //     //     const res = await fetch(`${baseUrl}/products`, {
// //     //         method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(product)
// //     //     });
// //     //     if (!res.ok) throw new Error('createProduct failed');
// //     //     return res.json();
// //     // } catch (err) {
// //     //     console.log('createProduct', err.message);
// //     //     throw err;
// //     // }
// //
// //     //this is a dummy return
// //     // Simulate successful creation
// //     console.log('createProduct called', product);
// //     return {...product, id: Date.now()};
// //
// // }
// //
// // export async function createSale(sale) {
// //     // try {
// //     //     const res = await fetch(`${baseUrl}/sales`, {
// //     //         method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(sale)
// //     //     });
// //     //     if (!res.ok) throw new Error('createSale failed');
// //     //     return res.json();
// //     // } catch (err) {
// //     //     console.log('createSale', err.message);
// //     //     throw err;
// //     // }
// //
// //     //this is a dummy return
// //     // Simulate successful creation
// //     console.log('createSale called', sale);
// //     return {...sale, id: Date.now()};
// //
// // }
//
//
// src/api/_api.js
// Replace baseUrl and functions to match your backend API (MongoDB + Express etc).


// ------------------------------- Backend Synced API --------------------------------------
// src/api/_api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://sprightlier-deepwater-tanisha.ngrok-free.dev/api'; // replace with your backend URL

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


// // --------------------------- Dummy Data for testing --------------------------------------
// const baseUrl = 'https://your-backend.example.com/api'; // <- replace when ready
//
// export async function fetchCustomers() {
//     return [
//         {
//             id: '1',
//             name: 'John Doe',
//             address: '123 Main St, Springfield',
//             phone: '555-1234',
//             email: 'john@example.com',
//             dateAdded: '2023-01-01'
//         },
//         {
//             id: '2',
//             name: 'Jane Smith',
//             address: '456 Market St, Springfield',
//             phone: '555-5678',
//             email: 'jane@example.com',
//             dateAdded: '2023-02-15'
//         },
//         {
//             id: '3',
//             name: 'Alice Johnson',
//             address: '789 Oak Ave, Springfield',
//             phone: '555-8765',
//             email: 'alice@example.com',
//             dateAdded: '2023-03-10'
//         },
//         {
//             id: '4',
//             name: 'Bob Brown',
//             address: '101 Pine St, Springfield',
//             phone: '555-4321',
//             email: 'bob@example.com',
//             dateAdded: '2023-04-22'
//         },
//         {
//             id: '5',
//             name: 'Charlie Davis',
//             address: '202 Elm St, Springfield',
//             phone: '555-9087',
//             email: 'charlie@example.com',
//             dateAdded: '2023-05-11'
//         },
//         {
//             id: '6',
//             name: 'Emma Williams',
//             address: '303 Maple Dr, Springfield',
//             phone: '555-1122',
//             email: 'emma@example.com',
//             dateAdded: '2023-06-05'
//         },
//         {
//             id: '7',
//             name: 'David Lee',
//             address: '404 Birch Blvd, Springfield',
//             phone: '555-3344',
//             email: 'david@example.com',
//             dateAdded: '2023-07-16'
//         },
//         {
//             id: '8',
//             name: 'Sophia Wilson',
//             address: '505 Cedar Ln, Springfield',
//             phone: '555-5566',
//             email: 'sophia@example.com',
//             dateAdded: '2023-08-08'
//         },
//         {
//             id: '9',
//             name: 'Lucas Martinez',
//             address: '606 Pinehill Rd, Springfield',
//             phone: '555-7788',
//             email: 'lucas@example.com',
//             dateAdded: '2023-09-19'
//         },
//         {
//             id: '10',
//             name: 'Olivia Garcia',
//             address: '707 Willow Way, Springfield',
//             phone: '555-9900',
//             email: 'olivia@example.com',
//             dateAdded: '2023-10-02'
//         },
//     ];
// }
//
//
// export async function fetchProducts() {
//     return [
//         {
//             id: '1',
//             name: 'Product A',
//             sellingPrice: 10,
//             purchasingPrice: 7,
//             stock: 100,
//             type: 'Tablet',
//             drugLicense: 'DL-001',
//             validity: '2026-01-01',
//             manufacturer: 'PharmaCo',
//             batchNo: 'A12345',
//             expiryDate: '2026-01-01'
//         },
//         {
//             id: '2',
//             name: 'Product B',
//             sellingPrice: 20,
//             purchasingPrice: 12,
//             stock: 50,
//             type: 'Capsule',
//             drugLicense: 'DL-002',
//             validity: '2025-06-30',
//             manufacturer: 'MediPharma',
//             batchNo: 'B12345',
//             expiryDate: '2025-06-30'
//         },
//         {
//             id: '3',
//             name: 'Product C',
//             sellingPrice: 15,
//             purchasingPrice: 9,
//             stock: 75,
//             type: 'Syrup',
//             drugLicense: 'DL-003',
//             validity: '2024-12-31',
//             manufacturer: 'Medico',
//             batchNo: 'C12345',
//             expiryDate: '2024-12-31'
//         },
//         {
//             id: '4',
//             name: 'Product D',
//             sellingPrice: 25,
//             purchasingPrice: 15,
//             stock: 30,
//             type: 'Injection',
//             drugLicense: 'DL-004',
//             validity: '2026-07-15',
//             manufacturer: 'BioPharm',
//             batchNo: 'D12345',
//             expiryDate: '2026-07-15'
//         },
//         {
//             id: '5',
//             name: 'Product E',
//             sellingPrice: 50,
//             purchasingPrice: 35,
//             stock: 20,
//             type: 'Ointment',
//             drugLicense: 'DL-005',
//             validity: '2025-05-25',
//             manufacturer: 'DermaHealth',
//             batchNo: 'E12345',
//             expiryDate: '2025-05-25'
//         },
//         {
//             id: '6',
//             name: 'Product F',
//             sellingPrice: 30,
//             purchasingPrice: 22,
//             stock: 100,
//             type: 'Tablet',
//             drugLicense: 'DL-006',
//             validity: '2026-04-12',
//             manufacturer: 'HealthFirst',
//             batchNo: 'F12345',
//             expiryDate: '2026-04-12'
//         },
//         {
//             id: '7',
//             name: 'Product G',
//             sellingPrice: 18,
//             purchasingPrice: 10,
//             stock: 200,
//             type: 'Capsule',
//             drugLicense: 'DL-007',
//             validity: '2025-11-15',
//             manufacturer: 'MedPlus',
//             batchNo: 'G12345',
//             expiryDate: '2025-11-15'
//         },
//         {
//             id: '8',
//             name: 'Product H',
//             sellingPrice: 45,
//             purchasingPrice: 30,
//             stock: 60,
//             type: 'Syrup',
//             drugLicense: 'DL-008',
//             validity: '2024-08-25',
//             manufacturer: 'HealthCare',
//             batchNo: 'H12345',
//             expiryDate: '2024-08-25'
//         },
//         {
//             id: '9',
//             name: 'Product I',
//             sellingPrice: 12,
//             purchasingPrice: 8,
//             stock: 150,
//             type: 'Injection',
//             drugLicense: 'DL-009',
//             validity: '2026-02-01',
//             manufacturer: 'PharmaLife',
//             batchNo: 'I12345',
//             expiryDate: '2026-02-01'
//         },
//         {
//             id: '10',
//             name: 'Product J',
//             sellingPrice: 55,
//             purchasingPrice: 40,
//             stock: 120,
//             type: 'Ointment',
//             drugLicense: 'DL-010',
//             validity: '2025-09-30',
//             manufacturer: 'HealthCorp',
//             batchNo: 'J12345',
//             expiryDate: '2025-09-30'
//         },
//     ];
// }
//
//
// export async function createCustomer(customer) {
//     // Simulate successful creation; return with string id
//     console.log('createCustomer called', customer);
//     return {...customer, id: String(Date.now())};
// }
//
// export async function createProduct(product) {
//     console.log('createProduct called', product);
//     return {...product, id: String(Date.now())};
// }
//
// export async function createSale(sale) {
//     console.log('createSale called', sale);
//     return {...sale, id: String(Date.now())};
// }

