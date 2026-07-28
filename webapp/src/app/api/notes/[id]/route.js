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

export async function PUT(req, { params }) {
  const user = await getUser(req);
  if (!user) return corsResponse({ error: "Unauthorized" }, 401);

  const note = await prisma.note.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!note) return corsResponse({ error: "Not found" }, 404);

  const body = await req.json();

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

  return corsResponse({ note: updated });
}

export async function DELETE(req, { params }) {
  const user = await getUser(req);
  if (!user) return corsResponse({ error: "Unauthorized" }, 401);

  const note = await prisma.note.findFirst({
    where: { id: params.id, userId: user.id },
  });
  if (!note) return corsResponse({ error: "Not found" }, 404);

  await prisma.note.delete({ where: { id: params.id } });
  return corsResponse({ success: true });
}