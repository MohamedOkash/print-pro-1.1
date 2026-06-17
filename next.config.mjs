/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Required for pdf-lib, fabric.js, and canvas
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
  // Allow cross-origin for Google Fonts
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};

export default nextConfig;
