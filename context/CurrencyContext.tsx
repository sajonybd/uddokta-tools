
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Currency = 'USD' | 'BDT' | 'INR' | 'PKR';

interface CurrencyContextType {
    currency: Currency;
    setCurrency: (c: Currency) => void;
    convertPrice: (priceInUSD: number) => number;
    formatPrice: (priceInUSD: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

const RATES: Record<Currency, number> = {
    USD: 1,
    BDT: 120, // Fallback
    INR: 85,  // Fallback
    PKR: 280  // Fallback
};

const SYMBOLS: Record<Currency, string> = {
    USD: '$',
    BDT: '৳',
    INR: '₹',
    PKR: '₨'
};

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
    const [currency, setCurrency] = useState<Currency>('BDT');
    const [rates, setRates] = useState<Record<string, number>>(RATES);

    useEffect(() => {
        const saved = localStorage.getItem('site_currency') as Currency;
        if (saved) {
            setCurrency(saved);
        }

        // Fetch dynamic rates
        fetch('/api/exchange-rates')
            .then(res => res.json())
            .then(data => {
                if (data && !data.error) {
                    setRates(prev => ({ ...prev, ...data }));
                }
            })
            .catch(err => console.error("Failed to load rates", err));
    }, []);

    const handleSetCurrency = (c: Currency) => {
        setCurrency(c);
        localStorage.setItem('site_currency', c);
    };

    const convertPrice = (priceInUSD: number) => {
        const rate = rates[currency] || 1;
        return priceInUSD * rate;
    };

    const formatPrice = (priceInUSD: number) => {
        const converted = convertPrice(priceInUSD);
        // Round nicely: if 0, return 0. If > 0, maybe round to nearest integer for non-USD?
        // Let's keep 2 decimals for USD, integer for others mostly?
        // For simplicity, 2 decimals for USD, 0 for others.
        const amount = currency === 'USD' ? converted.toFixed(2) : Math.round(converted).toString();
        return `${SYMBOLS[currency]}${amount}`;
    };

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, convertPrice, formatPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
