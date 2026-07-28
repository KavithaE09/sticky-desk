import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/getUser";
import fs from "fs";
import path from "path";
import os from "os";

// Reads the local Electron config.json and imports notes into the DB
export async function POST(req) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Path to the desktop app's config.json
  const configPath = path.join(
    process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming"),
    "StickyDesk",
    "config.json"
  );

  let localNotes = [];
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    const cfg = JSON.parse(raw);
    localNotes = cfg.notes || [];
  } catch (e) {
    return NextResponse.json({ error: "Could not read desktop config.json", detail: e.message }, { status: 400 });
  }

  if (!localNotes.length) {
    return NextResponse.json({ imported: 0, message: "No desktop notes found to import." });
  }

  // Upsert a "desktop" page
  const page = await prisma.page.upsert({
    where: { userId_pageKey: { userId: user.id, pageKey: "desktop" } },
    update: { title: "StickyDesk Desktop", url: "desktop://stickydesk" },
    create: { userId: user.id, pageKey: "desktop", url: "desktop://stickydesk", title: "StickyDesk Desktop" },
  });

  let imported = 0;
  for (const note of localNotes) {
    try {
      await prisma.note.create({
        data: {
          userId: user.id,
          pageId: page.id,
          content: note.content || "",
          comment: note.comment || null,
          colorIndex: note.colorIndex ?? 0,
          pinned: false,
          posX: note.x ?? 100,
          posY: note.y ?? 100,
        },
      });
      imported++;
    } catch (e) {
      // skip duplicates or errors
    }
  }

  return NextResponse.json({ imported, total: localNotes.length, message: `${imported} desktop notes imported!` });
}
