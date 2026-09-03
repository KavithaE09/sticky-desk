import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, category, subject, description, severity } = body;

    if (!name || !email || !category || !description) {
      return NextResponse.json(
        { error: "Name, email, category, and description are required." },
        { status: 400 }
      );
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        name,
        email,
        category,
        subject: subject || null,
        description,
        severity: severity || "medium",
        status: "open",
      },
    });

    return NextResponse.json({ success: true, ticketId: ticket.id }, { status: 200 });
  } catch (err) {
    console.error("Support API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const tickets = await prisma.supportTicket.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ tickets });
  } catch (err) {
    console.error("Support GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
