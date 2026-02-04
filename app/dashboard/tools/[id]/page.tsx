import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Info, AlertTriangle } from "lucide-react";
import Link from "next/link";
import dbConnect from "@/lib/mongodb";
import Tool from "@/models/Tool";
import { notFound } from "next/navigation";

interface ToolAccessPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ToolAccessPage(props: ToolAccessPageProps) {
  const params = await props.params;
  const { id } = params;
  await dbConnect();
  
  let tool;
  try {
     tool = await Tool.findById(id);
  } catch (e) {
      notFound();
  }

  if (!tool) {
    notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center space-x-2 mb-6">
         <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft className="h-6 w-6" />
         </Link>
         <h1 className="text-3xl font-bold tracking-tight">{tool.name}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
              {/* Access Area */}
              <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                          <ExternalLink className="h-5 w-5 text-primary" />
                          Access Tool
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <p className="text-sm text-foreground/80">
                          Click the button below to launch {tool.name}. A new window will open.
                      </p>
                      <Button className="w-full h-12 text-lg" asChild>
                          <a href={tool.url} target="_blank" rel="noopener noreferrer">
                              Launch {tool.name}
                          </a>
                      </Button>
                      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-background/50 p-2 rounded">
                          <Info className="h-4 w-4 mt-0.5" />
                          <p>
                              If the tool does not open or asks for login, please ensure you have the extension installed (if required) or contact support.
                          </p>
                      </div>
                  </CardContent>
              </Card>

              {/* Tool Description */}
               <Card>
                  <CardHeader>
                      <CardTitle>About this Tool</CardTitle>
                  </CardHeader>
                   <CardContent>
                       <p className="text-foreground/80 leading-relaxed">
                           {tool.description}
                       </p>
                   </CardContent>
               </Card>
          </div>

          <div className="space-y-6">
              {/* Status Card */}
               <Card>
                   <CardHeader>
                       <CardTitle>Status</CardTitle>
                   </CardHeader>
                   <CardContent>
                       <div className="flex items-center gap-2">
                           {tool.status === 'active' ? (
                               <div className="flex items-center gap-2 text-green-500 font-medium">
                                   <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                   Operational
                               </div>
                           ) : (
                               <div className="flex items-center gap-2 text-yellow-500 font-medium">
                                   <AlertTriangle className="h-4 w-4" />
                                   {tool.status === 'maintenance' ? 'Maintenance' : 'Offline'}
                               </div>
                           )}
                       </div>
                   </CardContent>
               </Card>
               
               {/* Quick Info */}
                <Card>
                   <CardHeader>
                       <CardTitle>Details</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-2">
                       <div className="flex justify-between text-sm">
                           <span className="text-muted-foreground">Category</span>
                           <span className="font-medium">{tool.category}</span>
                       </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-muted-foreground">Access Type</span>
                           <span className="font-medium">Direct Link</span>
                       </div>
                   </CardContent>
               </Card>
          </div>
      </div>
    </div>
  );
}
