import { NextResponse } from "next/server";
import { ZodError, type ZodSchema } from "zod";

export async function parseJsonBody<T>(request: Request, schema: ZodSchema<T>) {
  const json = (await request.json()) as unknown;
  return schema.parse(json);
}

export function jsonError(error: unknown, status = 400) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        issues: error.flatten(),
      },
      { status },
    );
  }

  return NextResponse.json(
    {
      error: error instanceof Error ? error.message : "Unexpected server error.",
    },
    { status },
  );
}
