import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";

function corsResponse(data, status = 200) {
  const res = NextResponse.json(data, { status });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res;
}

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET(req) {
  const user = await getUser(req);
  if (!user) return corsResponse({ error: "Unauthorized" }, 401);

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  const plan = dbUser?.plan || "free";

  const { searchParams } = new URL(req.url);
  const pageKey = searchParams.get("pageKey");

  if (pageKey) {
    const page = await prisma.page.findUnique({
      where: { userId_pageKey: { userId: user.id, pageKey } },
      include: { notes: { orderBy: { createdAt: "desc" } } },
    });
    return corsResponse({ notes: page?.notes || [], page, plan });
  }

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    include: { page: true },
    orderBy: { createdAt: "desc" },
  });
  return corsResponse({ notes, plan });
}

export async function POST(req) {
  const user = await getUser(req);
  if (!user) return corsResponse({ error: "Unauthorized" }, 401);

  const body = await req.json();
  const { content, comment, colorIndex, pinned, posX, posY, pageKey, pageUrl, pageTitle } = body;

  if (!content) return corsResponse({ error: "Content required" }, 400);

  let pageId = null;
  if (pageKey) {
    const page = await prisma.page.upsert({
      where: { userId_pageKey: { userId: user.id, pageKey } },
      update: { title: pageTitle || pageKey, url: pageUrl || "" },
      create: { userId: user.id, pageKey, url: pageUrl || "", title: pageTitle || pageKey },
    });
    pageId = page.id;
  }

  const note = await prisma.note.create({
    data: {
      userId: user.id,
      pageId,
      content,
      comment: comment || null,
      colorIndex: colorIndex ?? 0,
      pinned: !!pinned,
      posX: posX ?? 100,
      posY: posY ?? 100,
      sourceUrl: pageUrl || null,
      sourceTitle: pageTitle || null,
    },
    include: { page: true },
  });

  return corsResponse({ note });
}