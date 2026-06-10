import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") as any) || "OPEN";

  const trades = await prisma.trade.findMany({
    where: { status },
    include: {
      invoice: { select: { amount: true, currency: true, dueDate: true, debtorName: true, status: true } },
      seller: { select: { stellarAddress: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(trades);
}

export async function POST(req: NextRequest) {
  const { invoiceId, stellarAddress, price, discount } = await req.json();

  const seller = await prisma.user.findUnique({ where: { stellarAddress } });
  if (!seller) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const trade = await prisma.trade.create({
    data: { invoiceId, sellerId: seller.id, price: parseFloat(price), discount: parseFloat(discount) },
  });

  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "TRADING" } });
  return NextResponse.json(trade, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const { tradeId, txHash } = await req.json();
  const trade = await prisma.trade.update({
    where: { id: tradeId },
    data: { status: "COMPLETED", txHash },
  });
  return NextResponse.json(trade);
}
