import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import {
  getCustomizationUploadMaxFileSize,
  isAllowedCustomizationImageType,
} from "@/server/uploads/upload-config";

type UploadedCustomizationImage = {
  url: string;
  storageKey: string;
  fileName: string;
  fileType: string;
  fileSize: number;
};

function readRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function createS3Client() {
  return new S3Client({
    region: process.env.MIN_HON_UPLOAD_REGION ?? "us-east-1",
    endpoint: process.env.MIN_HON_UPLOAD_ENDPOINT || undefined,
    forcePathStyle: process.env.MIN_HON_UPLOAD_FORCE_PATH_STYLE === "true",
    credentials: {
      accessKeyId: readRequiredEnv("MIN_HON_UPLOAD_ACCESS_KEY_ID"),
      secretAccessKey: readRequiredEnv("MIN_HON_UPLOAD_SECRET_ACCESS_KEY"),
    },
  });
}

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function buildPublicUrl(storageKey: string) {
  const publicBaseUrl = process.env.MIN_HON_UPLOAD_PUBLIC_BASE_URL;
  if (publicBaseUrl) {
    return `${publicBaseUrl.replace(/\/$/, "")}/${storageKey}`;
  }

  const bucket = readRequiredEnv("MIN_HON_UPLOAD_BUCKET");
  const endpoint = process.env.MIN_HON_UPLOAD_ENDPOINT;
  const region = process.env.MIN_HON_UPLOAD_REGION ?? "us-east-1";

  if (endpoint) {
    const normalizedEndpoint = endpoint.replace(/\/$/, "");
    if (process.env.MIN_HON_UPLOAD_FORCE_PATH_STYLE === "true") {
      return `${normalizedEndpoint}/${bucket}/${storageKey}`;
    }

    const endpointUrl = new URL(normalizedEndpoint);
    return `${endpointUrl.protocol}//${bucket}.${endpointUrl.host}/${storageKey}`;
  }

  return `https://${bucket}.s3.${region}.amazonaws.com/${storageKey}`;
}

export async function uploadCustomizationImage(params: {
  sessionId: string;
  file: File;
}): Promise<UploadedCustomizationImage> {
  const { file, sessionId } = params;
  const maxFileSize = getCustomizationUploadMaxFileSize();

  if (!isAllowedCustomizationImageType(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WebP image.");
  }

  if (file.size > maxFileSize) {
    throw new Error(`Image size must be ${Math.round(maxFileSize / (1024 * 1024))}MB or smaller.`);
  }

  const bucket = readRequiredEnv("MIN_HON_UPLOAD_BUCKET");
  const prefix = (process.env.MIN_HON_UPLOAD_PREFIX ?? "customizations").replace(/^\/+|\/+$/g, "");
  const fileExtension = file.name.includes(".") ? file.name.split(".").pop() : "bin";
  const storageKey = `${prefix}/${sessionId}/${randomUUID()}-${sanitizeFileName(file.name || `upload.${fileExtension}`)}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const client = createS3Client();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: storageKey,
      Body: bytes,
      ContentType: file.type,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return {
    url: buildPublicUrl(storageKey),
    storageKey,
    fileName: file.name,
    fileType: file.type,
    fileSize: file.size,
  };
}
