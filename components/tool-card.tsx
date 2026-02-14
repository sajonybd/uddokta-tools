import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, XCircle, Clock, AlertCircle, ShoppingCart } from "lucide-react";
import Link from "next/link";

interface ToolCardProps {
    name: string;
    description: string;
    icon?: React.ReactNode; 
    status: "active" | "maintenance" | "inactive";
    category: string;
    url?: string;
    access?: {
        status: 'active' | 'expired';
        expiryDate?: string;
        packageId?: string;
    };
}

export function ToolCard({ name, description, icon, status, category, url, access }: ToolCardProps) {
  const isExpired = access?.status === 'expired';
  const showAccessButton = status === 'active' && !isExpired;
  
  return (
    <Card className={`hover:shadow-lg transition-all duration-300 border-border/50 bg-card ${isExpired ? 'opacity-80 border-dashed' : ''}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
            {name}
        </CardTitle>
        <div className="flex gap-1">
            {status === "active" ? (
                isExpired ? (
                    <Badge variant="destructive" className="gap-1 flex items-center">
                        <AlertCircle size={12} /> Expired
                    </Badge>
                ) : (
                    <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 gap-1 flex items-center">
                        <CheckCircle size={12} /> Active
                    </Badge>
                )
            ) : (
                <Badge variant="destructive" className="gap-1 flex items-center">
                     <XCircle size={12} /> {status === "maintenance" ? "Maintenance" : "Offline"}
                </Badge>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
             <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${isExpired ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'}`}>
                 {icon}
             </div>
             <div className="flex-1">
                 <p className="text-sm text-foreground/60 font-medium">{category}</p>
                 <CardDescription className="line-clamp-2">{description}</CardDescription>
             </div>
        </div>
        
        {access?.expiryDate && (
             <div className={`text-xs flex items-center gap-1 ${isExpired ? 'text-red-500' : 'text-muted-foreground'}`}>
                 <Clock size={12} /> 
                 {isExpired ? 'Expired on:' : 'Expires:'} {new Date(access.expiryDate).toLocaleDateString()}
             </div>
        )}
      </CardContent>
      <CardFooter>
        {isExpired ? (
            <Button className="w-full gap-2" variant="default" asChild>
                <Link href="/premium-tools">
                    Renew Subscription <ShoppingCart size={16} />
                </Link>
            </Button>
        ) : (
            <Button className="w-full gap-2" variant={status === "active" ? "default" : "secondary"} disabled={status !== "active"} asChild={status === "active"}>
                {status === "active" && url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer">
                        Access Tool <ExternalLink size={16} />
                    </a>
                ) : (
                    <span className="flex items-center gap-2">
                        {status === "active" ? "Access Tool" : "Unavailable"} 
                        <ExternalLink size={16} />
                    </span>
                )}
            </Button>
        )}
      </CardFooter>
    </Card>
  );
}
