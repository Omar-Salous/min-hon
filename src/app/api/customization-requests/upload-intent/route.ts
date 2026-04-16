import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/server/api/route-utils";
import { createUploadIntent } from "@/server/services/commerce-service";
import { uploadIntentSchema } from "@/server/validation/commerce";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, uploadIntentSchema);
    const uploadIntent = await createUploadIntent(payload);
    return NextResponse.json({ uploadIntent }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
