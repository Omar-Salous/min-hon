import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

function createRemotePatternFromUrl(
  value: string | undefined,
): RemotePattern | null {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    const protocol = url.protocol.replace(":", "");

    if (protocol !== "http" && protocol !== "https") {
      return null;
    }

    return {
      protocol,
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: `${url.pathname.replace(/\/$/, "")}/**`,
    };
  } catch {
    return null;
  }
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      createRemotePatternFromUrl(process.env.MIN_HON_UPLOAD_PUBLIC_BASE_URL),
      createRemotePatternFromUrl(process.env.MIN_HON_UPLOAD_ENDPOINT),
    ].filter((pattern): pattern is RemotePattern => pattern !== null),
  },
};

export default nextConfig;
