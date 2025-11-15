// src/screens/ProductsScreen.js
import React, {useContext} from 'react';
import {FlatList, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';

export default function ProductsScreen({navigation}) {
    const {products} = useContext(_AppContext);

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header title="Products" onBack={() => navigation.goBack()} onAdd={() => navigation.navigate('AddProduct')}
                    backgroundColor="#6d28d9"/>

            <FlatList
                data={products}
                keyExtractor={i => String(i.id)}
                contentContainerStyle={{padding: 12}}
                renderItem={({item}) => (
                    <View style={{backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10}}>
                        <Text style={{fontWeight: '700'}}>{item.name}</Text>
                        <Text style={{color: '#6b7280'}}>Type: {item.type} • Stock: {item.stock}</Text>
                        <Text style={{marginTop: 8}}>Price: ${item.sellingPrice} • Purchase:
                            ${item.purchasingPrice}</Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={{padding: 12}}>No products</Text>}
            />
        </SafeAreaView>
    );
}
