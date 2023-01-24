/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  transpilePackages: ["@las-motillos/acciona-client"],
};

module.exports = nextConfig;
