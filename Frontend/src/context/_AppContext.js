// src/context/_AppContext.js
import React, {createContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api/_api';

export const _AppContext = createContext();

export const AppProvider = ({children}) => {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);

    const [user, setUser] = useState(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const userData = await AsyncStorage.getItem("user");

                if (token && userData) {
                    setUser(JSON.parse(userData));  // ✅ restore login
                }
            } catch (err) {
                console.log("Auth restore error:", err);
            }

            setLoadingAuth(false);
        })();
    }, []);


    const login = async (userData, token) => {
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        await AsyncStorage.removeItem("userToken");
        await AsyncStorage.removeItem("user");
        setUser(null);
    };


    // Load cached data and optionally fetch from backend
    useEffect(() => {
        (async () => {
            try {
                const cu = await AsyncStorage.getItem('customers');
                const pr = await AsyncStorage.getItem('products');
                const sh = await AsyncStorage.getItem('salesHistory');

                if (cu) setCustomers(JSON.parse(cu));
                if (pr) setProducts(JSON.parse(pr) || []);
                if (sh) setSalesHistory(JSON.parse(sh));

                // Fetch remote data
                const remoteCustomers = await api.fetchCustomers();
                if (remoteCustomers) {
                    setCustomers(remoteCustomers);
                    await AsyncStorage.setItem('customers', JSON.stringify(remoteCustomers));
                }

                const remoteProducts = await api.fetchProducts();
                setProducts(Array.isArray(remoteProducts) ? remoteProducts : []);

            } catch (err) {
                console.log('API fetch error (ok if offline):', err.message);
            }
        })();
    }, []);

    // Persist products to state + AsyncStorage
    const persistProducts = async (next) => {
        setProducts(next);
        await AsyncStorage.setItem('products', JSON.stringify(next));
    };

    // Decrement stock for items [{ id, quantity }]
    const decrementStock = async (items = []) => {
        if (!items.length) return;
        const next = products.map(p => {
            const found = items.find(i => String(i.id) === String(p.id));
            if (found) {
                const newStock = Math.max(0, (Number(p.stock) || 0) - Number(found.quantity || found.qty || 0));
                return {...p, stock: newStock};
            }
            return p;
        });
        await persistProducts(next);
    };

    // Increment stock for items
    const incrementStock = async (items = []) => {
        if (!items.length) return;
        const next = products.map(p => {
            const found = items.find(i => String(i.id) === String(p.id));
            if (found) {
                const newStock = (Number(p.stock) || 0) + Number(found.quantity || found.qty || 0);
                return {...p, stock: newStock};
            }
            return p;
        });
        await persistProducts(next);
    };

    // Add a new customer
    const addCustomer = async (form) => {

        // Make sure we have latest customers from backend
        try {
            const remote = await api.fetchCustomers();
            if (Array.isArray(remote)) {
                setCustomers(remote);
                await AsyncStorage.setItem('customers', JSON.stringify(remote));
            }
        } catch (e) {
            console.log("Could not fetch remote customers, using local list.");
        }


        try {
            // 1️⃣ Generate unique customerCode
            // Generate next customerCode
            let nextCode = "0001";
            if (customers.length > 0) {
                const lastCode = customers
                    .map(c => parseInt(c.customerCode || "0"))
                    .filter(n => !isNaN(n))
                    .sort((a, b) => b - a)[0];

                nextCode = String((lastCode || 0) + 1).padStart(4, "0");
            }


            // 2️⃣ Determine medical representative
            const userStr = await AsyncStorage.getItem('user');
            const user = userStr ? JSON.parse(userStr) : {};
            const medicalRepName = form.medRep || user.name || 'Unknown MR';

            // 3️⃣ Build payload for backend
            const customerPayload = {
                name: form.name.trim(),
                email: form.email?.trim() || '',
                typeOfBusiness: form.typeOfBusiness || 'Pharmacy',
                medicalRepName,
                phone: form.phone?.trim() || '',
                zone: form.zone || 'Zone A',
                province: form.province?.trim() || '',
                address: form.address?.trim() || '',
                remark: form.remark?.trim() || '',
                date: form.date || new Date().toISOString().split('T')[0],
                customerCode: nextCode,
            };

            console.log('Payload sent to backend:', customerPayload);

            // 4️⃣ Send to backend
            const newCustomer = await api.createCustomer(customerPayload);

            // 5️⃣ Update local state + AsyncStorage
            const next = [newCustomer, ...customers];
            setCustomers(next);
            await AsyncStorage.setItem('customers', JSON.stringify(next));

            return newCustomer;
        } catch (err) {
            console.error('Failed to add customer:', err.response?.data || err.message);
            throw err;
        }
    };

    // Add a product
    const addProduct = async (product) => {
        const id = product.id ?? String(Date.now());
        const next = [{...product, id}, ...products];
        await persistProducts(next);
        api.createProduct(product).catch(() => {
        });
    };

    // Update a product
    const updateProduct = async (id, updates) => {
        const next = products.map(p => (String(p.id) === String(id) ? {...p, ...updates} : p));
        await persistProducts(next);
        if (api.updateProduct) api.updateProduct({id, ...updates}).catch(() => {
        });
    };

    // Create a sale record
    const createSale = async (saleData) => {
        const sale = {
            id: String(Date.now()),
            invoice: saleData.invoice,
            customerId: saleData.customerId,
            customerName: saleData.customerName,
            items: saleData.items,
            discount: saleData.discount || 0,
            vat: saleData.vat || 0,
            greenTotal: saleData.greenTotal,
            deposit: saleData.deposit || 0,
            paidAmount: saleData.paidAmount || 0,
            balanceAmount: saleData.balanceAmount,
            returnsAmount: 0,
            paymentType: saleData.paymentType || 'Cash',
            createdAt: new Date().toISOString(),
        };

        // Save to sales history
        const updatedHistory = [sale, ...salesHistory];
        setSalesHistory(updatedHistory);
        await AsyncStorage.setItem('salesHistory', JSON.stringify(updatedHistory));

        // Update stock
        const stockItems = sale.items.map(i => ({id: i.id, quantity: i.quantity}));
        await decrementStock(stockItems);

        return sale;
    };

    // Add sale record (wrapper for API + local)
    const addSaleRecord = async (sale) => {
        const next = [{...sale, id: String(Date.now())}, ...salesHistory];
        setSalesHistory(next);
        await AsyncStorage.setItem('salesHistory', JSON.stringify(next));
        api.createSale(sale).catch(() => {
        });
    };

    return (
        <_AppContext.Provider
            value={{
                user, loadingAuth,
                login, logout,
                customers, products, salesHistory,
                addCustomer, addProduct, updateProduct,
                decrementStock, incrementStock, createSale, addSaleRecord
            }}
        >
            {children}
        </_AppContext.Provider>
    );
};
