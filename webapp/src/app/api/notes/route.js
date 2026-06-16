import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";

export async function GET(req) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const pageKey = searchParams.get("pageKey");

  if (pageKey) {
    const page = await prisma.page.findUnique({
      where: { userId_pageKey: { userId: user.id, pageKey } },
      include: { notes: { orderBy: { createdAt: "desc" } } },
    });
    return NextResponse.json({ notes: page?.notes || [], page });
  }

  const notes = await prisma.note.findMany({
    where: { userId: user.id },
    include: { page: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ notes });
}

export async function POST(req) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content, comment, colorIndex, pinned, posX, posY, pageKey, pageUrl, pageTitle } = body;

  if (!content) return NextResponse.json({ error: "Content required" }, { status: 400 });

  if (user.plan === "free") {
    const count = await prisma.note.count({ where: { userId: user.id } });
    if (count >= 50) return NextResponse.json({ error: "Free plan limit reached. Upgrade to Pro!" }, { status: 403 });
  }

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

  return NextResponse.json({ note });
}