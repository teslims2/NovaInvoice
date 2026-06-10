import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sorobanRegisterInvoice, submitSorobanTx } from "@/lib/soroban";

export async function POST(req: NextRequest) {
  const { invoiceId, signedXdr, stellarAddress } = await req.json();

  const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
  if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

  if (signedXdr) {
    // Submit pre-signed XDR
    const { hash } = await submitSorobanTx(signedXdr);
    const updated = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { txHash: hash, contractId: process.env.NEXT_PUBLIC_SOROBAN_CONTRACT_ID },
    });
    return NextResponse.json(updated);
  }

  // Build unsigned tx for client to sign
  const xdr = await sorobanRegisterInvoice(
    stellarAddress,
    invoiceId,
    invoice.amount,
    Math.floor(invoice.dueDate.getTime() / 1000)
  );
  return NextResponse.json({ xdr });
}
