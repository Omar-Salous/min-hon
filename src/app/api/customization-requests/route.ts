import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/server/api/route-utils";
import { createCustomizationRequest } from "@/server/services/commerce-service";
import { customizationRequestSchema } from "@/server/validation/commerce";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, customizationRequestSchema);
    const customizationRequest = await createCustomizationRequest(payload);
    return NextResponse.json({ customizationRequest }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
