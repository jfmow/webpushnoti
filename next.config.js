/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

const withOffline = require('next-offline');

module.exports = withOffline(nextConfig);
