/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['news1.suddsy.dev', 'news2.suddsy.dev', '127.0.0.1'],
  }
}

const withOffline = require('next-offline');

module.exports = withOffline(nextConfig);
