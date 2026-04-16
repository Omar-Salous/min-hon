import { NextResponse } from "next/server";
import { jsonError } from "@/server/api/route-utils";
import {
  getCustomizationUploadMaxFileSize,
  isAllowedCustomizationImageType,
} from "@/server/uploads/upload-config";
import { uploadCustomizationImage } from "@/server/uploads/s3-storage";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const sessionId = String(formData.get("sessionId") ?? "").trim();
    const file = formData.get("file");

    if (!sessionId) {
      return NextResponse.json(
        { error: "A session id is required before uploading artwork." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please choose an image file to upload." },
        { status: 400 },
      );
    }

    if (!isAllowedCustomizationImageType(file.type)) {
      return NextResponse.json(
        { error: "Please upload a JPG, PNG, or WebP image." },
        { status: 400 },
      );
    }

    if (file.size > getCustomizationUploadMaxFileSize()) {
      return NextResponse.json(
        {
          error: `Image size must be ${Math.round(getCustomizationUploadMaxFileSize() / (1024 * 1024))}MB or smaller.`,
        },
        { status: 400 },
      );
    }

    const uploadedImage = await uploadCustomizationImage({
      sessionId,
      file,
    });

    return NextResponse.json({ uploadedImage }, { status: 201 });
  } catch (error) {
    return jsonError(error, 500);
  }
}
