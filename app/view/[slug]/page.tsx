import { notFound, redirect } from "next/navigation";
import dbConnect from "@/lib/mongodb";
import CustomPage from "@/models/CustomPage";
import Tool from "@/models/Tool";
import Package from "@/models/Package";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface ViewPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function ViewCustomPage(props: ViewPageProps) {
  const params = await props.params;
  const { slug } = params;
  const session = await getServerSession(authOptions);

  if (!session) {
      redirect(`/login?callbackUrl=/view/${slug}`);
  }

  await dbConnect();
  
  // 1. Fetch Page
  let page;
  try {
      page = await CustomPage.findOne({ slug });
  } catch (e) {
      notFound();
  }

  if (!page) notFound();

  const user = session.user as any;

  // 2. Check Admin Role (Bypass)
  if (user.role === 'admin') {
      return (
        <div className="min-h-screen bg-background">
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      );
  }

  // 3. Find Tool Linked to this Page
  const linkedTool = await Tool.findOne({ linkedPage: page._id });
  
  if (!linkedTool) {
      // If no tool is linked, fallback to public or basic role check if any
      // For now, if not linked to a tool, we might assume it's public or check page.accessRules
      // But per requirement, access is via tool. 
      // Let's fallback to page.accessRules.allowedRoles if exists
      if (page.accessRules?.allowedRoles?.length > 0) {
          if (!page.accessRules.allowedRoles.includes(user.role)) {
               return <AccessDenied message="Restricted Access" />;
          }
      }
      // If no tool logic and no role logic, show content? Or deny?
      // Assuming 'Public' if no restriction.
      return (
        <div className="min-h-screen bg-background">
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </div>
      );
  }

  // 4. Check User Subscriptions for Linked Tool
  const dbUser = await User.findById(user.id).populate({
      path: 'subscriptions.packageId',
      model: 'Package',
      populate: {
          path: 'tools',
          model: 'Tool'
      }
  });

  if (!dbUser) return <AccessDenied message="User not found" />;

  const activeSubscriptions = dbUser.subscriptions.filter((sub: any) => {
      const now = new Date();
      return sub.status === 'active' && new Date(sub.endDate) > now;
  });

  let hasAccess = false;

  for (const sub of activeSubscriptions) {
      const pkg = sub.packageId;
      if (pkg && pkg.tools) {
          const toolIds = pkg.tools.map((t: any) => t._id.toString());
          if (toolIds.includes(linkedTool._id.toString())) {
              hasAccess = true;
              break;
          }
      }
  }

  if (!hasAccess) {
       return (
          <div className="flex h-screen items-center justify-center">
              <div className="text-center max-w-md p-6 border rounded-lg shadow-lg">
                  <h1 className="text-2xl font-bold text-destructive mb-4">Access Denied</h1>
                  <p className="mb-4 text-gray-600">
                      To access this content, you need a subscription that includes the <strong>{linkedTool.name}</strong> tool.
                  </p>
                  <a href="/dashboard/billing" className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90 transition">
                      View Packages
                  </a>
              </div>
          </div>
      )
  }

  return (
    <div className="min-h-screen bg-background">
        <div dangerouslySetInnerHTML={{ __html: page.content }} />
    </div>
  );
}

function AccessDenied({ message }: { message: string }) {
    return (
        <div className="flex h-screen items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-destructive">{message}</h1>
            </div>
        </div>
    );
}
