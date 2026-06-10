import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { address } = await req.json();
  if (!address) return NextResponse.json({ error: "Address required" }, { status: 400 });

  const user = await prisma.user.upsert({
    where: { stellarAddress: address },
    update: {},
    create: { stellarAddress: address },
    select: { id: true, stellarAddress: true, role: true, isVerified: true },
  });

  return NextResponse.json(user);
}
