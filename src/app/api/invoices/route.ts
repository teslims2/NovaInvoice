import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const status = searchParams.get("status") as any;

  const invoices = await prisma.invoice.findMany({
    where: {
      ...(address && { issuer: { stellarAddress: address } }),
      ...(status && { status }),
    },
    include: { issuer: { select: { stellarAddress: true, isVerified: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(invoices);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { stellarAddress, amount, currency, dueDate, description, debtorName, debtorAddress, discountRate } = body;

  const issuer = await prisma.user.findUnique({ where: { stellarAddress } });
  if (!issuer) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const invoice = await prisma.invoice.create({
    data: {
      issuerId: issuer.id,
      amount: parseFloat(amount),
      currency: currency || "USDC",
      dueDate: new Date(dueDate),
      description,
      debtorName,
      debtorAddress,
      discountRate: parseFloat(discountRate || "0"),
    },
  });
  return NextResponse.json(invoice, { status: 201 });
}
