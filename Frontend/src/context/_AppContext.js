// src/context/_AppContext.js
import React, {createContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../api/_api';

export const _AppContext = createContext();

export const AppProvider = ({children}) => {
    const [customers, setCustomers] = useState([]);
    const [products, setProducts] = useState([]);
    const [salesHistory, setSalesHistory] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const cu = await AsyncStorage.getItem('customers');
                const pr = await AsyncStorage.getItem('products');
                const sh = await AsyncStorage.getItem('salesHistory');

                if (cu) setCustomers(JSON.parse(cu));
                if (pr) setProducts(JSON.parse(pr));
                if (sh) setSalesHistory(JSON.parse(sh));

                // Try remote fetch (no-op if backend not configured)
                const remoteCustomers = await api.fetchCustomers();
                if (remoteCustomers) {
                    setCustomers(remoteCustomers);
                    await AsyncStorage.setItem('customers', JSON.stringify(remoteCustomers));
                }
                const remoteProducts = await api.fetchProducts();
                if (remoteProducts) {
                    setProducts(remoteProducts);
                    await AsyncStorage.setItem('products', JSON.stringify(remoteProducts));
                }
            } catch (err) {
                console.log('API fetch error (ok if offline):', err.message);
            }
        })();
    }, []);

    const persistProducts = async (next) => {
        setProducts(next);
        await AsyncStorage.setItem('products', JSON.stringify(next));
    };


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
            paymentType: saleData.paymentType || "Cash",
            createdAt: new Date().toISOString()
        };

        // Save to sales history
        const updatedHistory = [sale, ...salesHistory];
        setSalesHistory(updatedHistory);
        await AsyncStorage.setItem("salesHistory", JSON.stringify(updatedHistory));

        // Update stock
        const stockItems = sale.items.map(i => ({
            id: i.id,
            quantity: i.quantity
        }));
        await decrementStock(stockItems);

        return sale;
    };


    const addCustomer = async (customer) => {
        const id = customer.id ?? String(Date.now());
        const next = [{...customer, id}, ...customers];
        setCustomers(next);
        await AsyncStorage.setItem('customers', JSON.stringify(next));
        api.createCustomer(customer).catch(() => {
        });
    };

    const addProduct = async (product) => {
        const id = product.id ?? String(Date.now());
        const next = [{...product, id}, ...products];
        await persistProducts(next);
        api.createProduct(product).catch(() => {
        });
    };

    const updateProduct = async (id, updates) => {
        const next = products.map(p => (String(p.id) === String(id) ? {...p, ...updates} : p));
        await persistProducts(next);
        if (api.updateProduct) api.updateProduct({id, ...updates}).catch(() => {
        });
    };

    // decrement stock for each item list: [{ id, qty }]
    const decrementStock = async (items = []) => {
        if (!items || items.length === 0) return;
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

    // increment stock (used by returns)
    const incrementStock = async (items = []) => {
        if (!items || items.length === 0) return;
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

    const addSaleRecord = async (sale) => {
        const next = [{...sale, id: String(Date.now())}, ...salesHistory];
        setSalesHistory(next);
        await AsyncStorage.setItem('salesHistory', JSON.stringify(next));
        api.createSale(sale).catch(() => {
        });
    };

    return (
        <_AppContext.Provider value={{
            customers, products, salesHistory,
            addCustomer, addProduct, updateProduct,
            decrementStock, incrementStock, addSaleRecord
        }}>
            {children}
        </_AppContext.Provider>
    );
};
