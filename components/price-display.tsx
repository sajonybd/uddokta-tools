
"use client";

import { useCurrency } from "@/context/CurrencyContext";

export function PriceDisplay({ amount }: { amount: number }) {
    const { formatPrice } = useCurrency();
    
    // If amount is not a number or negative, handle gracefully
    if (typeof amount !== 'number' || amount < 0) return null;
    
    // If free
    if (amount === 0) return <span>Free</span>;

    return <span>{formatPrice(amount)}</span>;
}
