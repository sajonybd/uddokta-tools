"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { useCart } from "@/components/providers/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Trash2, ShoppingBag, Banknote, CreditCard, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PriceDisplay } from "@/components/price-display";

export default function CheckoutPage() {
  const { items, removeFromCart, cartTotal, discountAmount, finalTotal, clearCart, coupon } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [paymentProof, setPaymentProof] = useState("");
  // In a real app, this would be a file upload logic that returns a URL
  // For MVP, letting user paste a URL or transaction ID

  const handlePlaceOrder = async () => {
       if (!session) {
           toast.error("Please login to complete your order");
           router.push("/login?callbackUrl=/checkout");
           return;
       }
       
       if (finalTotal > 0 && !paymentProof) {
           toast.error("Please provide payment proof (Transaction ID)");
           return;
       }

       setLoading(true);
       try {
           const res = await fetch("/api/orders", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                   items: items.map(item => ({ _id: item._id })), // Minimal info needed
                   paymentMethod: finalTotal === 0 ? 'free' : 'offline',
                   paymentProof,
                   couponCode: coupon?.code // Send coupon code if exists
               })
           });

           const data = await res.json();
           
           if (!res.ok) {
               throw new Error(data.error || "Order failed");
           }

           clearCart();
           toast.success("Order placed successfully!");
           
           if (data.status === 'approved') {
               router.push("/dashboard");
           } else {
               // Pending page or dashboard order history
               router.push("/dashboard/billing"); // or somewhere they can see orders
           }

       } catch (error: any) {
           toast.error(error.message);
       } finally {
           setLoading(false);
       }
  };

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>
            
            <div className="grid md:grid-cols-3 gap-8">
                {/* Order Summary */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {items.length === 0 ? (
                                <p className="text-muted-foreground">Your cart is empty.</p>
                            ) : (
                                items.map(item => (
                                    <div key={item._id} className="flex justify-between items-center py-2 border-b last:border-0">
                                        <div>
                                            <h4 className="font-medium">{item.name}</h4>
                                            <p className="text-sm text-muted-foreground"><PriceDisplay amount={item.price} /></p>
                                        </div>
                                        <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => removeFromCart(item._id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                ))
                            )}
                            
                            {/* Totals */}
                            <div className="pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span><PriceDisplay amount={cartTotal} /></span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-<PriceDisplay amount={discountAmount} /></span>
                                    </div>
                                )}
                                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span><PriceDisplay amount={finalTotal} /></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Payment */}
                    {items.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment Details</CardTitle>
                                <CardDescription>
                                    {finalTotal === 0 ? "No payment required for this order." : "Complete your payment securely."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {finalTotal === 0 ? (
                                    <div className="flex items-center gap-2 text-green-600 p-4 bg-green-500/10 rounded-lg">
                                        <ShoppingBag size={24} />
                                        <span className="font-semibold">Free Order - Instant Activation</span>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="p-4 bg-muted rounded-lg border">
                                            <h4 className="font-semibold flex items-center gap-2 mb-2">
                                                <Banknote size={18} /> Manual Payment (Bkash / Nagad / Rocket)
                                            </h4>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                Please send <strong><PriceDisplay amount={finalTotal} /></strong> (or equivalent BDT) to one of the following numbers:
                                            </p>
                                            <ul className="text-sm space-y-1 mb-4">
                                                <li><strong>Bkash:</strong> 017xxxxxxxx (Personal)</li>
                                                <li><strong>Nagad:</strong> 017xxxxxxxx (Personal)</li>
                                                <li><strong>Rocket:</strong> 017xxxxxxxx (Personal)</li>
                                            </ul>
                                            <p className="text-xs text-muted-foreground">Please use the current exchange rate shown above.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Enter Transaction ID / Payment Proof</Label>
                                            <Input 
                                                placeholder="e.g. TRX12345678" 
                                                value={paymentProof}
                                                onChange={(e) => setPaymentProof(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                Admin will verify this transaction ID before approving your order.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Actions */}
                <div className="md:col-span-1">
                     <Card>
                         <CardContent className="p-6">
                             {!session ? (
                                 <div className="text-center space-y-4">
                                     <p className="text-sm text-muted-foreground">Please login to continue checkout.</p>
                                     <Link href="/login?callbackUrl=/checkout" className="w-full block">
                                         <Button className="w-full">Login</Button>
                                     </Link>
                                 </div>
                             ) : (
                                 <div className="space-y-4">
                                     <p className="text-sm text-muted-foreground text-center">
                                         Logged in as <strong>{session.user?.name || session.user?.email}</strong>
                                     </p>
                                     <Button 
                                        className="w-full" 
                                        size="lg" 
                                        onClick={handlePlaceOrder}
                                        disabled={loading || items.length === 0}
                                     >
                                         {loading ? <Loader2 className="animate-spin mr-2" /> : null}
                                         {finalTotal === 0 ? "Confirm Free Order" : "Place Order"}
                                     </Button>
                                 </div>
                             )}
                         </CardContent>
                     </Card>
                </div>
            </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
