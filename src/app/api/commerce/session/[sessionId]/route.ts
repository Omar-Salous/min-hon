import { NextResponse } from "next/server";
import { jsonError } from "@/server/api/route-utils";
import { getSessionCommerceState } from "@/server/services/commerce-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { sessionId } = await context.params;
    const snapshot = await getSessionCommerceState(sessionId);
    return NextResponse.json(snapshot);
  } catch (error) {
    return jsonError(error, 500);
  }
}
