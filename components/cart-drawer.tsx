"use client";

import { useCart } from "@/components/providers/cart-provider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PriceDisplay } from "./price-display";

export function CartDrawer() {
  const {
    items,
    removeFromCart,
    cartTotal,
    discountAmount,
    finalTotal,
    isCartOpen,
    setIsCartOpen,
    applyCoupon,
    removeCoupon,
    coupon
  } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsValidating(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, items }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
      } else {
        applyCoupon(data.coupon);
        setCouponCode(""); 
      }
    } catch (error) {
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCheckout = () => {
      setIsCartOpen(false);
      router.push("/checkout");
  }

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {items.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {items.length}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col h-full w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Your Cart ({items.length})</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <ShoppingCart className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <Button variant="link" onClick={() => setIsCartOpen(false)}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex items-center gap-4 bg-muted/40 p-3 rounded-lg">
                  <div className="h-16 w-16 bg-primary/10 rounded-md flex items-center justify-center flex-shrink-0">
                     <span className="text-xs font-bold text-primary">PKG</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                    <p className="text-sm text-muted-foreground"><PriceDisplay amount={item.price} /></p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => removeFromCart(item._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div>
                 {coupon ? (
                     <div className="flex items-center justify-between bg-green-500/10 p-2 rounded border border-green-500/20">
                         <span className="text-green-600 text-sm font-medium">
                             Code: {coupon.code} applied
                         </span>
                         <Button variant="ghost" size="sm" onClick={removeCoupon} className="h-6 w-6 p-0 text-green-600">
                             <X size={14} />
                         </Button>
                     </div>
                 ) : (
                    <div className="flex gap-2">
                        <Input 
                            placeholder="Coupon code" 
                            value={couponCode} 
                            onChange={(e) => setCouponCode(e.target.value)}
                        />
                        <Button variant="outline" onClick={handleApplyCoupon} disabled={isValidating || !couponCode}>
                            {isValidating ? "..." : "Apply"}
                        </Button>
                    </div>
                 )}
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span><PriceDisplay amount={cartTotal} /></span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount</span>
                    <span>-<PriceDisplay amount={discountAmount} /></span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span><PriceDisplay amount={finalTotal} /></span>
              </div>
            </div>
            
            <SheetFooter>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
                </Button>
            </SheetFooter>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
