import { NextResponse } from "next/server";
import { jsonError } from "@/server/api/route-utils";
import { listProducts } from "@/server/services/commerce-service";

export async function GET() {
  try {
    const products = await listProducts();
    return NextResponse.json({ products });
  } catch (error) {
    return jsonError(error, 500);
  }
}
