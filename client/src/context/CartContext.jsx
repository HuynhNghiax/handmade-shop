import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    useEffect(() => {
        const savedCart = localStorage.getItem('pinkyCart');
        if (savedCart) setCartItems(JSON.parse(savedCart));
    }, []);

    // Lưu vào localStorage mỗi khi cartItems thay đổi
    useEffect(() => {
        localStorage.setItem('pinkyCart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity) => {
        setCartItems(prev => {
            const index = prev.findIndex(item => item.id === product.id);
            if (index > -1) {
                const newItems = [...prev];
                newItems[index].quantity += quantity;
                return newItems;
            }
            return [...prev, { ...product, quantity }];
        });
    };

    const removeItem = (id) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id, delta) => {
        setCartItems(prev => prev.map(item => 
            item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ));
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.removeItem('pinkyCart');
    };

    const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeItem, updateQuantity, clearCart, cartCount }}>
            {children}
        </CartContext.Provider>
    );
};