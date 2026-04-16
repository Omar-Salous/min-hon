import { NextResponse } from "next/server";
import { jsonError, parseJsonBody } from "@/server/api/route-utils";
import { saveReview } from "@/server/services/commerce-service";
import { saveReviewSchema } from "@/server/validation/commerce";

export async function POST(request: Request) {
  try {
    const payload = await parseJsonBody(request, saveReviewSchema);
    const review = await saveReview(payload);
    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
