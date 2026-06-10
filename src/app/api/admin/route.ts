import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "invoices";

  if (type === "users") {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, stellarAddress: true, role: true, isVerified: true, createdAt: true, _count: { select: { invoices: true } } },
    });
    return NextResponse.json(users);
  }

  const invoices = await prisma.invoice.findMany({
    where: { status: "PENDING" },
    include: { issuer: { select: { stellarAddress: true, isVerified: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const { type, id, action } = await req.json();

  if (type === "user") {
    const user = await prisma.user.update({
      where: { id },
      data: { isVerified: action === "verify" },
    });
    return NextResponse.json(user);
  }

  if (type === "invoice") {
    const invoice = await prisma.invoice.update({
      where: { id },
      data: { status: action === "verify" ? "VERIFIED" : "PENDING" },
    });
    return NextResponse.json(invoice);
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
