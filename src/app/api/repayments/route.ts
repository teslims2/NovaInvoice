import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get("invoiceId");
  const repayments = await prisma.repayment.findMany({
    where: invoiceId ? { invoiceId } : {},
    include: { invoice: { select: { amount: true, currency: true, debtorName: true } } },
    orderBy: { paidAt: "desc" },
  });
  return NextResponse.json(repayments);
}

export async function POST(req: NextRequest) {
  const { invoiceId, amount, txHash } = await req.json();

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  const [repayment] = await prisma.$transaction([
    prisma.repayment.create({
      data: { invoiceId, amount: parseFloat(amount), txHash, status: txHash ? "COMPLETED" : "PENDING" },
    }),
    prisma.invoice.update({ where: { id: invoiceId }, data: { status: "REPAID" } }),
    prisma.investment.updateMany({
      where: { invoiceId, status: "ACTIVE" },
      data: { status: "REPAID" },
    }),
  ]);

  return NextResponse.json(repayment, { status: 201 });
}
