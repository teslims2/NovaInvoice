import { NextRequest, NextResponse } from "next/server";
import { nativeToScVal } from "@stellar/stellar-sdk";
import { prisma } from "@/lib/prisma";
import { buildContractTx, submitSorobanTx } from "@/lib/soroban";

export async function POST(req: NextRequest) {
  const { invoiceId, stellarAddress, signedXdr } = await req.json();

  if (signedXdr) {
    const { hash } = await submitSorobanTx(signedXdr);
    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: "REPAID", txHash: hash },
    });
    return NextResponse.json(invoice);
  }

  const xdr = await buildContractTx(stellarAddress, "repay_invoice", [
    nativeToScVal(invoiceId, { type: "string" }),
  ]);
  return NextResponse.json({ xdr });
}
