import type { NextConfig } from "next";

function createRemotePatternFromUrl(value: string | undefined) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return {
      protocol: url.protocol.replace(":", ""),
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
    ].filter((pattern): pattern is NonNullable<typeof pattern> => Boolean(pattern)),
  },
};

export default nextConfig;
