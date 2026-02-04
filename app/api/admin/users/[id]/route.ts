import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== "admin") {
     // Second check for admin role
     // We can also check email again if role persistence had issues
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;
  const body = await req.json();
  const { role, status } = body;

  await dbConnect();

  try {
    const user = await User.findByIdAndUpdate(
      id,
      { 
          ...(role && { role }), 
          ...(status && { status }) 
      },
      { new: true }
    );
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
