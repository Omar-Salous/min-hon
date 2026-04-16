import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/server/api/route-utils";
import { appendChatMessage } from "@/server/services/commerce-service";
import { createChatMessageSchema } from "@/server/validation/commerce";

export async function POST(
  request: Request,
  context: { params: Promise<{ chatSessionId: string }> },
) {
  try {
    const { chatSessionId } = await context.params;
    const payload = await parseJsonBody(request, createChatMessageSchema);
    const chatMessage = await appendChatMessage(chatSessionId, payload);
    return NextResponse.json({ chatMessage }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
