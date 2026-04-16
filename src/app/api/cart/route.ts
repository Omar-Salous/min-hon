import { NextResponse } from "next/server";
import { addToCartSchema, sessionQuerySchema } from "@/server/validation/commerce";
import { jsonError, parseJsonBody } from "@/server/api/route-utils";
import { addCartItem, clearCart, getSessionCommerceState } from "@/server/services/commerce-service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const { sessionId } = sessionQuerySchema.parse({
      sessionId: url.searchParams.get("sessionId"),
    });
    const snapshot = await getSessionCommerceState(sessionId);
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, addToCartSchema);
    const snapshot = await addCartItem(payload);
    return NextResponse.json(snapshot, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const { sessionId } = sessionQuerySchema.parse({
      sessionId: url.searchParams.get("sessionId"),
    });
    const snapshot = await clearCart(sessionId);
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}
