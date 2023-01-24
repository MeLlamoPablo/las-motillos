/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    transpilePackages: ["@las-motillos/acciona-client"],
  },
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;
