import { NextResponse } from "next/server";
import { createOrderSchema } from "@/server/validation/commerce";
import { jsonError, parseJsonBody } from "@/server/api/route-utils";
import { createOrderFromSession } from "@/server/services/commerce-service";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, createOrderSchema);
    const order = await createOrderFromSession(payload);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
