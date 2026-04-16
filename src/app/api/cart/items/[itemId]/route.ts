import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/server/api/route-utils";
import { removeCartItem, updateCartItem } from "@/server/services/commerce-service";
import { sessionQuerySchema, updateCartItemSchema } from "@/server/validation/commerce";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await context.params;
    const url = new URL(request.url);
    const { sessionId } = sessionQuerySchema.parse({
      sessionId: url.searchParams.get("sessionId"),
    });
    const payload = await parseJsonBody(request, updateCartItemSchema);
    const snapshot = await updateCartItem(sessionId, itemId, payload);
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ itemId: string }> },
) {
  try {
    const { itemId } = await context.params;
    const url = new URL(request.url);
    const { sessionId } = sessionQuerySchema.parse({
      sessionId: url.searchParams.get("sessionId"),
    });
    const snapshot = await removeCartItem(sessionId, itemId);
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error);
  }
}
