/** @type {import('next').NextConfig} */
import webpack from "next/dist/compiled/webpack/webpack-lib.js";

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@nodara/shared", "@nodara/utils"],
  eslint: { ignoreDuringBuilds: false },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };

    config.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^@x402\// })
    );

    return config;
  },
};

export default nextConfig;