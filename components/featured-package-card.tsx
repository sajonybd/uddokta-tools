"use client";

import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/providers/cart-provider";
import { useRouter } from "next/navigation";
import { PriceDisplay } from "@/components/price-display";

export function FeaturedPackageCard({ pkg }: { pkg: any }) {
  const { addToCart } = useCart();
  const router = useRouter();

  const handleBuyNow = () => {
    addToCart(pkg, false);
    router.push("/checkout");
  };

  return (
    <Card
      className="border-2 transition-all duration-300 rounded-2xl p-8 bg-primary/5 border-primary scale-105 shadow-2xl shadow-primary/30 relative"
    >
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-md">
         Most Popular
      </div>
      
      <h3 className="text-2xl font-bold text-foreground mb-2 text-center">{pkg.name}</h3>
      <p className="text-foreground/60 text-sm mb-6 text-center">{pkg.description}</p>
      
      <div className="mb-8 text-center">
        <span className="text-5xl font-bold text-foreground">
            <PriceDisplay amount={pkg.price} />
        </span>
        <span className="text-foreground/60 ml-2">/{pkg.interval === 'yearly' ? 'year' : 'month'}</span>
      </div>

      <Button
        onClick={handleBuyNow}
        className="w-full py-6 text-lg rounded-lg font-bold transition shadow-xl shadow-primary/30 mb-8"
      >
        Buy Plan
      </Button>

      <ul className="space-y-4">
        {pkg.features && pkg.features.map((feature: string, i: number) => (
          <li key={i} className="flex items-center gap-3">
            <Check className="w-5 h-5 text-primary flex-shrink-0 font-bold" />
            <span className="text-foreground/80">{feature}</span>
          </li>
        ))}
         {/* List tools if features are empty/generic */}
         {pkg.tools && pkg.tools.length > 0 && (
             <>
                <li className="font-semibold pt-2 border-t mt-2">Included Tools:</li>
                {pkg.tools.slice(0, 5).map((t: any) => (
                     <li key={t._id} className="flex items-center gap-3 text-sm">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span>{t.name}</span>
                     </li>
                ))}
                {pkg.tools.length > 5 && <li className="text-xs text-muted-foreground pl-5">+ {pkg.tools.length - 5} more</li>}
             </>
         )}
      </ul>
    </Card>
  );
}
