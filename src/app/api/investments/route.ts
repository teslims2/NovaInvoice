import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const address = searchParams.get("address");
  const investments = await prisma.investment.findMany({
    where: address ? { investor: { stellarAddress: address } } : {},
    include: {
      invoice: { select: { amount: true, currency: true, dueDate: true, status: true, debtorName: true } },
    },
    orderBy: { fundedAt: "desc" },
  });
  return NextResponse.json(investments);
}

export async function POST(req: NextRequest) {
  const { invoiceId, stellarAddress, amount, txHash } = await req.json();

  const investor = await prisma.user.findUnique({ where: { stellarAddress } });
  if (!investor) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const [investment] = await prisma.$transaction([
    prisma.investment.create({
      data: { invoiceId, investorId: investor.id, amount: parseFloat(amount), txHash },
    }),
    prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "FUNDED" },
    }),
  ]);

  return NextResponse.json(investment, { status: 201 });
}
