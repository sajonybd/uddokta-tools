import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";

interface ToolCardProps {
    name: string;
    description: string;
    icon?: React.ReactNode; 
    status: "active" | "maintenance" | "inactive";
    category: string;
    url?: string;
}

export function ToolCard({ name, description, icon, status, category, url }: ToolCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50 bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{name}</CardTitle>
        {status === "active" ? (
             <Badge variant="secondary" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 gap-1">
                <CheckCircle size={12} /> Online
             </Badge>
        ) : (
            <Badge variant="destructive" className="gap-1">
                 <XCircle size={12} /> {status === "maintenance" ? "Maintenance" : "Offline"}
            </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-4">
            {/* Placeholder for Icon/Image if we had one, for now using pure CSS/Icon */}
             <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                 {icon}
             </div>
             <div>
                 <p className="text-sm text-foreground/60 font-medium">{category}</p>
                 <CardDescription className="line-clamp-2">{description}</CardDescription>
             </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full gap-2" variant={status === "active" ? "default" : "secondary"} disabled={status !== "active"} asChild={status === "active"}>
            {status === "active" && url ? (
                 <a href={url}>
                    Access Tool <ExternalLink size={16} />
                 </a>
            ) : (
                <span className="flex items-center gap-2">
                    {status === "active" ? "Access Tool" : "Unavailable"} 
                    <ExternalLink size={16} />
                </span>
            )}
        </Button>
      </CardFooter>
    </Card>
  );
}
