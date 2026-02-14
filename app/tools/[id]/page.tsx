import { notFound } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import Package from "@/models/Package";
import Tool from "@/models/Tool";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import Image from "next/image";
import { ProductCard } from "@/components/product-card";

interface ToolPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ToolDetailsPage(props: ToolPageProps) {
  const params = await props.params;
  const { id } = params;
  await dbConnect();
  
  console.log(Tool); // Ensure model compilation

  let pkg;
  try {
      pkg = await Package.findById(id).populate('tools');
  } catch (e) {
      notFound();
  }

  if (!pkg || pkg.status !== 'active') notFound();
  
  const pkgJson = JSON.parse(JSON.stringify(pkg));

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
            
            <div className="grid md:grid-cols-2 gap-12 items-start">
                {/* Left: Visuals */}
                <div className="space-y-6">
                    <div className="relative aspect-video rounded-xl overflow-hidden border bg-muted/20 flex items-center justify-center">
                        <div className="text-center p-6">
                            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                                {pkg.name}
                            </h2>
                            {pkg.price === 0 && <Badge className="mt-4 bg-green-500/10 text-green-500">Free</Badge>}
                        </div>
                    </div>
                </div>

                {/* Right: Details */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-4">{pkg.name}</h1>
                        <div className="flex items-end gap-2 mb-6">
                             <span className="text-4xl font-bold text-primary">${pkg.price}</span>
                             {pkg.interval && <span className="text-foreground/60 mb-1">/{pkg.interval === 'monthly' ? 'mo' : 'yr'}</span>}
                        </div>
                        <p className="text-lg text-foreground/70 leading-relaxed">
                            {pkg.description || "Get access to premium tools with this package."}
                        </p>
                    </div>

                    <div className="p-6 bg-card border rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-4">Included Tools</h3>
                        {pkg.tools && pkg.tools.length > 0 ? (
                            <div className="grid gap-4">
                                {pkg.tools.map((tool: any) => (
                                    <div key={tool._id} className="flex items-start gap-3">
                                        <div className="mt-1 h-2 w-2 rounded-full bg-primary" />
                                        <div>
                                            <span className="font-medium text-foreground">{tool.name}</span>
                                            {tool.description && <p className="text-sm text-muted-foreground">{tool.description}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No specific tools listed.</p>
                        )}
                    </div>
                    
                    {/* Reuse ProductCard for Purchase Actions */}
                    <div className="max-w-sm">
                        <ProductCard pkg={pkgJson} /> 
                    </div>
                </div>
            </div>

        </div>
      </div>
      <Footer />
    </main>
  );
}
