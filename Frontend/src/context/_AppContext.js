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
    const [returnsHistory, setReturnsHistory] = useState([]);


    // Restore authentication
    useEffect(() => {
        (async () => {
            try {
                const token = await AsyncStorage.getItem("userToken");
                const userData = await AsyncStorage.getItem("user");

                if (token && userData) {
                    setUser(JSON.parse(userData));
                }
            } catch (err) {
                console.log("Auth restore error:", err);
            }
            setLoadingAuth(false);
        })();
    }, []);


    // Load user's personal sales
    useEffect(() => {
        if (!user) return;
        (async () => {
            try {
                const mySales = await api.fetchMySales();

                if (Array.isArray(mySales)) {
                    // NORMALIZE THE DATA - Map _id to productId
                    const normalizedSales = mySales.map(sale => ({
                        ...sale,
                        id: sale._id || sale.id, // Add top-level id
                        invoiceNumber: sale.invoiceNumber || `INV-${Date.now()}`,
                        customerName: sale.customerName || 'Unknown Customer',
                        products: (sale.products || []).map((p) => ({
                            ...p,
                            // Map _id to productId for consistency
                            productId: p.productId || p._id || p.id,
                            id: p._id || p.id || p.productId, // Also add plain id
                            productName: p.productName || p.name || 'Unknown Product',
                            salesQty: p.salesQty || p.quantity || 0,
                            sellingPrice: p.sellingPrice || p.price || 0,
                        }))
                    }));

                    // Debug: log normalized structure
                    console.log("=== NORMALIZED SALES ===");
                    console.log(JSON.stringify(normalizedSales[0]?.products[0], null, 2));

                    setSalesHistory(normalizedSales);
                    await AsyncStorage.setItem('salesHistory', JSON.stringify(normalizedSales));
                }
            } catch (err) {
                console.log('Could not fetch my sales from backend:', err.message);
            }
        })();
    }, [user]);

    // LOGIN / LOGOUT
    const login = async (userData, token) => {
        await AsyncStorage.setItem("userToken", token);
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('user'); // clear saved user
            setUser(null); // this triggers MainStack to switch to auth screens
        } catch (e) {
            console.log('Error logging out:', e);
        }
    };


    // Persist returns to AsyncStorage
    const addReturn = async (returnRecord) => {
        const next = [returnRecord, ...returnsHistory];
        setReturnsHistory(next);
        await AsyncStorage.setItem('returnsHistory', JSON.stringify(next));
    };


    // LOAD CACHED DATA + SYNC
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

                // NORMALIZE CACHED SALES
                if (sh) {
                    const cachedSales = JSON.parse(sh);
                    const normalizedSales = cachedSales.map(sale => ({
                        ...sale,
                        id: sale._id || sale.id,
                        invoiceNumber: sale.invoiceNumber || `INV-${Date.now()}`,
                        customerName: sale.customerName || 'Unknown Customer',
                        products: (sale.products || []).map((p) => ({
                            ...p,
                            productId: p.productId || p._id || p.id,
                            id: p._id || p.id || p.productId,
                            productName: p.productName || p.name || 'Unknown Product',
                            salesQty: p.salesQty || p.quantity || 0,
                            sellingPrice: p.sellingPrice || p.price || 0,
                        }))
                    }));
                    setSalesHistory(normalizedSales);
                }

                // Fetch from backend
                const remoteCustomers = await api.fetchCustomers();
                if (remoteCustomers) {
                    setCustomers(remoteCustomers);
                    await AsyncStorage.setItem('customers', JSON.stringify(remoteCustomers));
                }

                const remoteProducts = await api.fetchProducts();
                let normalized = [];
                if (Array.isArray(remoteProducts)) {
                    normalized = remoteProducts;
                } else if (remoteProducts?.products) {
                    normalized = remoteProducts.products;
                } else if (remoteProducts?.data) {
                    normalized = remoteProducts.data;
                }
                setProducts(normalized);
                await AsyncStorage.setItem('products', JSON.stringify(normalized));

            } catch (err) {
                console.log('API fetch error (ok if offline):', err.message);
            }
        })();
    }, []);

    const persistProducts = async (next) => {
        const merged = next.map(newP => {
            const oldP = products.find(p => String(p._id) === String(newP._id)) || {};
            return {
                ...oldP,
                ...newP,
                stock: newP.stock !== undefined ? newP.stock : (oldP.stock || 0) // preserve old stock if new one is missing
            };
        });

        setProducts(merged);
        await AsyncStorage.setItem('products', JSON.stringify(merged));
    };


    const fetchLatestCustomers = async () => {
        const data = await api.fetchCustomers();
        setCustomers(data);
        await AsyncStorage.setItem('customers', JSON.stringify(data));
    };

    const fetchLatestProducts = async () => {
        const data = await api.fetchProducts();
        const normalized = Array.isArray(data) ? data : data?.products || data?.data || [];
        setProducts(normalized);
        await AsyncStorage.setItem('products', JSON.stringify(normalized));
    };


    // Stock update
    const decrementStock = async (items = []) => {
        if (!items.length) return;

        // Update backend first
        try {
            for (const item of items) {
                await api.removeStock({productId: item.id, quantity: item.quantity, note: 'Sale'});
            }
        } catch (err) {
            console.log('Backend removeStock failed:', err.message);
        }

        // Then update local state
        const next = products.map(p => {
            const found = items.find(i => String(i.id) === String(p.id));
            if (found) return {...p, stock: Math.max(0, p.stock - found.quantity)};
            return p;
        });
        await persistProducts(next);
    };

    const incrementStock = async (items = []) => {
        if (!items.length) return;

        // Update backend first
        try {
            for (const item of items) {
                await api.addStock({productId: item.id, quantity: item.quantity, note: 'Restock'});
            }
        } catch (err) {
            console.log('Backend addStock failed:', err.message);
        }

        // Then update local state
        const next = products.map(p => {
            const found = items.find(i => String(i.id) === String(p.id));
            if (found) return {...p, stock: p.stock + found.quantity};
            return p;
        });
        await persistProducts(next);
    };

    // Add customer
    const addCustomer = async (form) => {
        try {
            const remote = await api.fetchCustomers();
            if (Array.isArray(remote)) {
                setCustomers(remote);
                await AsyncStorage.setItem('customers', JSON.stringify(remote));
            }
        } catch {
        }

        try {
            let nextCode = "0001";
            if (customers.length > 0) {
                const lastCode = customers
                    .map(c => parseInt(c.customerCode || "0"))
                    .filter(n => !isNaN(n))
                    .sort((a, b) => b - a)[0];
                nextCode = String((lastCode || 0) + 1).padStart(4, "0");
            }

            const userStr = await AsyncStorage.getItem('user');
            const loggedUser = userStr ? JSON.parse(userStr) : {};
            const medicalRepName = form.medRep || loggedUser.name || 'Unknown MR';

            const payload = {...form, customerCode: nextCode, medicalRepName};
            const newCustomer = await api.createCustomer(payload);

            const next = [newCustomer, ...customers];
            setCustomers(next);
            await AsyncStorage.setItem("customers", JSON.stringify(next));
            return newCustomer;
        } catch (err) {
            console.log(err);
            throw err;
        }
    };

    // Create a sale
    const createSale = async ({selectedProducts, selectedCustomer, totalPaid, totalDue, remark}) => {
        if (!selectedProducts || !selectedCustomer) throw new Error("Selected products or customer is undefined");

        try {
            const productsArray = selectedProducts.map(p => ({
                productId: p.id,  // Keep the product ID
                productName: p.name,
                salesQty: Number(p.qty),
                bonusQty: 0,  // Added this as it was in your original SalesScreen
                totalQty: Number(p.qty),
                sellingPrice: Number(p.price),
                amount: Number((p.price * p.qty).toFixed(2)),
                discount: 0,  // Added this
                netSellingAmount: Number((p.price * p.qty).toFixed(2)),
                lc: 0,  // Added this
                profitLoss: 0,  // Added this
                isProductAccept: true  // Added this
            }));

            const saleRecord = {
                invoiceNumber: `INV-${Date.now()}`,
                mrName: user?.name || "Unknown",
                mrId: String(user?.id || user?._id || "unknown"),  // Ensure it's a string
                customerName: selectedCustomer.name,
                customerId: String(selectedCustomer.id),  // Ensure it's a string
                products: productsArray,  // Don't strip the IDs!
                totalAmount: productsArray.reduce((a, p) => a + p.netSellingAmount, 0),
                paidAmount: Number(totalPaid) || 0,
                dueAmount: Number(totalDue) || 0,
                paymentStatus: "Cash",
                remark: remark || "No remark",
                creditDays: 0,  // Added from your original
                deliveryDate: new Date(),  // Added from your original
                recordingDate: new Date(),  // Added from your original
                invoiceDate: new Date()  // Added from your original
            };

            // Debug log
            console.log("=== SALE PAYLOAD ===");
            console.log(JSON.stringify(saleRecord, null, 2));

            const updatedHistory = [saleRecord, ...salesHistory];
            setSalesHistory(updatedHistory);
            await AsyncStorage.setItem("salesHistory", JSON.stringify(updatedHistory));

            const stockItems = productsArray.map(p => ({id: p.productId, quantity: p.salesQty}));
            await decrementStock(stockItems);

            const result = await api.createSale(saleRecord);
            return result;
        } catch (err) {
            console.log("Failed to create sale:", err);
            console.log("Error response:", err.response?.data);  // This will show backend error
            throw err;
        }
    };

    return (
        <_AppContext.Provider
            value={{
                user,
                loadingAuth,
                login,
                logout,
                customers,
                products,
                salesHistory,
                addCustomer,
                decrementStock,
                incrementStock,
                createSale,
                persistProducts,
                addReturn,
                fetchLatestCustomers,
                fetchLatestProducts
            }}
        >
            {children}
        </_AppContext.Provider>
    );
};
