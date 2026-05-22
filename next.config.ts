import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  turbopack: {},
};

const config: NextConfig =
  process.env.NODE_ENV === "production"
    ? withPWAInit({
        dest: "public",
        register: true,
        workboxOptions: { skipWaiting: true },
      })(nextConfig)
    : nextConfig;

export default config;
