import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const billCreateSchema = z.object({
  type: z.enum(["ELE", "WATER"]),
  year: z.number().int().min(2000).max(2100),
  month: z.number().int().min(1).max(12),
  amount: z.number().nonnegative(),
  usage: z.number().nonnegative(),
  unitPrice: z.number().nonnegative().optional(),
});

const billQuerySchema = z.object({
  type: z.enum(["ELE", "WATER"]).optional(),
  year: z.coerce.number().int().optional(),
  month: z.coerce.number().int().optional(),
});

function getUserIdFromEnv(): string {
  const userId = process.env.SINGLE_USER_ID;
  if (!userId) {
    throw new Error("SINGLE_USER_ID is not set");
  }
  return userId;
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const parsed = billQuerySchema.safeParse({
    type: searchParams.get("type") ?? undefined,
    year: searchParams.get("year") ?? undefined,
    month: searchParams.get("month") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_QUERY", message: "查询参数不合法" } },
      { status: 400 },
    );
  }

  const { type, year, month } = parsed.data;

  try {
    const userId = getUserIdFromEnv();

    const bills = await prisma.bill.findMany({
      where: {
        userId,
        type,
        year,
        month,
      },
      orderBy: [
        { year: "desc" },
        { month: "desc" },
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, data: bills });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器内部错误" } },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: { code: "INVALID_JSON", message: "请求体必须是 JSON" } },
      { status: 400 },
    );
  }

  const parsed = billCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_BODY",
          message: "请求体参数不合法",
        },
      },
      { status: 400 },
    );
  }

  const { type, year, month, amount, usage, unitPrice } = parsed.data;

  try {
    const userId = getUserIdFromEnv();

    const bill = await prisma.bill.create({
      data: {
        userId,
        type,
        year,
        month,
        amount,
        usage,
        unitPrice: unitPrice ?? null,
      },
    });

    return NextResponse.json({ success: true, data: bill }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "服务器内部错误" } },
      { status: 500 },
    );
  }
}

