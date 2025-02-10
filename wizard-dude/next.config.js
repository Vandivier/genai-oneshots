/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Exclude 'phaser3spectorjs' from being processed
    config.resolve.alias = {
      ...config.resolve.alias,
      phaser3spectorjs: false,
    };

    return config;
  },
};

module.exports = nextConfig;
