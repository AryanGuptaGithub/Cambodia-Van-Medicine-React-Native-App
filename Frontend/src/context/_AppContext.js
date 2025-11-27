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


    useEffect(() => {
        if (!user) return; // wait until user is loaded
        (async () => {
            try {
                const mySales = await api.fetchMySales();
                if (Array.isArray(mySales)) {
                    setSalesHistory(mySales);
                    await AsyncStorage.setItem('salesHistory', JSON.stringify(mySales));
                }
            } catch (err) {
                console.log('Could not fetch my sales from backend, using local cache:', err.message);
            }
        })();
    }, [user]);


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
                if (pr) {
                    const parsed = JSON.parse(pr);

                    const normalized = Array.isArray(parsed)
                        ? parsed
                        : Array.isArray(parsed?.products)
                            ? parsed.products
                            : Array.isArray(parsed?.data)
                                ? parsed.data
                                : [];

                    setProducts(normalized);
                }

                if (sh) setSalesHistory(JSON.parse(sh));

                // Fetch remote data
                const remoteCustomers = await api.fetchCustomers();
                if (remoteCustomers) {
                    setCustomers(remoteCustomers);
                    await AsyncStorage.setItem('customers', JSON.stringify(remoteCustomers));
                }

                const remoteProducts = await api.fetchProducts();
                // console.log("REMOTE PRODUCTS RAW RESPONSE:", remoteProducts);


                let normalized = [];

                if (Array.isArray(remoteProducts)) {
                    normalized = remoteProducts;
                } else if (Array.isArray(remoteProducts?.products)) {
                    normalized = remoteProducts.products;
                } else if (remoteProducts?.data && Array.isArray(remoteProducts.data)) {
                    normalized = remoteProducts.data;
                }

                setProducts(normalized);
                await AsyncStorage.setItem('products', JSON.stringify(normalized));


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

    // Create a sale record
    // Replace the createSale function in _AppContext.js with this fixed version:

    const createSale = async ({selectedProducts, selectedCustomer, totalPaid, totalDue, remark = ''}) => {
        try {
            if (!selectedCustomer || !selectedCustomer.id) {
                throw new Error('Please select a customer.');
            }

            if (!selectedProducts || Object.keys(selectedProducts).length === 0) {
                throw new Error('No products selected.');
            }

            // 1️⃣ Convert selectedProducts object to array - KEEP THE ID
            const productsArray = Object.values(selectedProducts).map(p => ({
                id: p.id, // ✅ FIXED: Keep the ID for stock updates
                productName: p.name,
                salesQty: Number(p.qty),
                bonusQty: 0,
                totalQty: Number(p.qty),
                sellingPrice: Number(p.price),
                amount: Number((p.price * p.qty).toFixed(2)),
                discount: 0,
                netSellingAmount: Number((p.price * p.qty).toFixed(2))
            }));

            // 2️⃣ Build final sale record (without id in products for backend)
            const saleRecord = {
                invoiceNumber: `INV-${Date.now()}`,
                mrName: user?.name || 'Unknown',
                mrId: user?.id || user?._id || 'unknown',
                customerName: selectedCustomer.name,
                customerId: selectedCustomer.id,
                products: productsArray.map(({id, ...rest}) => rest), // Remove id for backend
                totalAmount: Number(productsArray.reduce((sum, p) => sum + p.netSellingAmount, 0).toFixed(2)),
                paidAmount: Number(totalPaid.toFixed(2)),
                dueAmount: Number(totalDue.toFixed(2)),
                paymentStatus: 'Cash',
                remark
            };

            console.log('Final saleRecord:', saleRecord);

            // 3️⃣ Save locally
            const updatedHistory = [saleRecord, ...salesHistory];
            setSalesHistory(updatedHistory);
            await AsyncStorage.setItem('salesHistory', JSON.stringify(updatedHistory));

            // 4️⃣ Update stock locally - NOW WITH CORRECT IDs
            const stockItems = productsArray.map(p => ({
                id: p.id,
                quantity: p.salesQty
            }));
            console.log('Decrementing stock for:', stockItems); // Debug log
            await decrementStock(stockItems);

            // 5️⃣ Send to backend
            const backendSale = await api.createSale(saleRecord);
            console.log('Sale saved to backend:', backendSale);

            return backendSale;
        } catch (err) {
            console.error('Failed to create sale:', err.response?.data || err.message || err);
            throw err;
        }
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
