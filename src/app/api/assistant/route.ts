import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { jsonError, parseJsonBody } from "@/server/api/route-utils";
import {
  assistantConversationQuerySchema,
  assistantRequestSchema,
} from "@/server/validation/assistant";
import {
  archiveAssistantConversation,
  getAssistantConversation,
  replyToAssistant,
} from "@/server/services/assistant-service";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const query = assistantConversationQuerySchema.parse({
      sessionId: url.searchParams.get("sessionId"),
      chatSessionId: url.searchParams.get("chatSessionId") ?? undefined,
    });

    const conversation = await getAssistantConversation(query);
    return NextResponse.json(conversation);
  } catch (error) {
    return jsonError(error, error instanceof ZodError ? 400 : 500);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, assistantRequestSchema);
    const response = await replyToAssistant(payload);
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return jsonError(error, error instanceof ZodError ? 400 : 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const query = assistantConversationQuerySchema.parse({
      sessionId: url.searchParams.get("sessionId"),
      chatSessionId: url.searchParams.get("chatSessionId") ?? undefined,
    });

    if (!query.chatSessionId) {
      return NextResponse.json({ archived: false }, { status: 400 });
    }

    await archiveAssistantConversation({
      sessionId: query.sessionId,
      chatSessionId: query.chatSessionId,
    });

    return NextResponse.json({ archived: true });
  } catch (error) {
    return jsonError(error, error instanceof ZodError ? 400 : 500);
  }
}
