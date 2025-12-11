/** @type {import('next').NextConfig} */
const nextConfig = {
  // Next.js serves files from public/ directory
  // Game files are in public/game/ (copied from game/)
  
  // Ensure static files are properly served
  async headers() {
    return [
      {
        source: '/game/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
