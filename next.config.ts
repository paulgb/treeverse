import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: false,

  async rewrites() {
    return [
      {
        source: '/ct/js/script.js',
        destination: 'https://plausible.io/js/script.js',
      },
      {
        source: '/ct/api/event',
        destination: 'https://plausible.io/api/event',
      },
    ]
  },
  /* config options here */
}

export default nextConfig
