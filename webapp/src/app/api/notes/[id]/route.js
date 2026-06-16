import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";

export async function PUT(req, { params }) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  // Pin to page — pageKey வந்தா page upsert பண்ணு
  let pageId = note.pageId;
  if (body.pageKey) {
    const page = await prisma.page.upsert({
      where: { userId_pageKey: { userId: user.id, pageKey: body.pageKey } },
      update: { title: body.pageTitle || body.pageKey, url: body.pageUrl || "" },
      create: { userId: user.id, pageKey: body.pageKey, url: body.pageUrl || "", title: body.pageTitle || body.pageKey },
    });
    pageId = page.id;
  }

  const updated = await prisma.note.update({
    where: { id: params.id },
    data: {
      content: body.content ?? note.content,
      comment: body.comment ?? note.comment,
      colorIndex: body.colorIndex ?? note.colorIndex,
      pinned: body.pinned ?? note.pinned,
      posX: body.posX ?? note.posX,
      posY: body.posY ?? note.posY,
      pageId,
    },
    include: { page: true },
  });

  return NextResponse.json({ note: updated });
}

export async function DELETE(req, { params }) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const note = await prisma.note.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.note.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}