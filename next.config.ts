import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

function createRemotePatternFromUrl(value?: string): RemotePattern | null {
  if (!value) return null;

  try {
    const url = new URL(value);

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || "",
      pathname: url.pathname && url.pathname !== "/" ? `${url.pathname}/**` : "/**",
    };
  } catch {
    return null;
  }
}

const remotePatterns: RemotePattern[] = [
  createRemotePatternFromUrl(process.env.MIN_HON_UPLOAD_PUBLIC_BASE_URL),
  createRemotePatternFromUrl(process.env.MIN_HON_UPLOAD_ENDPOINT),
].filter((pattern): pattern is RemotePattern => pattern !== null);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
};

export default nextConfig;