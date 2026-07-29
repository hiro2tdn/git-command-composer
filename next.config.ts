import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  // 静的エクスポートは本番ビルド時のみ。dev 中だと Fast Refresh が壊れやすい
  ...(isDev ? {} : { output: "export" as const }),
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};

export default nextConfig;
