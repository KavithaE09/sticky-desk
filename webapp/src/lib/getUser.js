import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "your-secret");

export async function getUser(req) {
  // 1. Bearer token — extension use பண்றது
  const auth = req.headers.get("authorization") || "";
  if (auth.startsWith("Bearer ")) {
    try {
      const token = auth.slice(7);
      const { payload } = await jwtVerify(token, SECRET);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      return user || null;
    } catch { return null; }
  }

  // 2. NextAuth session — dashboard use பண்றது
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return session.user;
}