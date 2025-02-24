/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'mhwgbmgsnkrbaxvewjxy.supabase.co',
      },
    ],
  },
}

module.exports = nextConfig 