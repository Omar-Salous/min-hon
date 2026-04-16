import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/server/api/route-utils";
import { createChatSession } from "@/server/services/commerce-service";
import { createChatSessionSchema } from "@/server/validation/commerce";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, createChatSessionSchema);
    const chatSession = await createChatSession(payload);
    return NextResponse.json({ chatSession }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
