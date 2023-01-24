/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
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
