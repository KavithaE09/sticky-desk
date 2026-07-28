import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";

export async function POST(req) {
  try {
    const user = await getUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newPlan = dbUser.plan === "pro" ? "free" : "pro";
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { plan: newPlan }
    });

    return NextResponse.json({ success: true, plan: updated.plan });
  } catch (error) {
    console.error("Error toggling plan:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
