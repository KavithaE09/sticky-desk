import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET /api/auth/token - extension calls this to get user token
export async function GET(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  // Return user info for extension
  return NextResponse.json({
    userId: session.user.id,
    email: session.user.email,
    name: session.user.name,
    plan: session.user.plan,
  });
}
