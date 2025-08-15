/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**' } // allow other https domains
    ]
  },
  reactStrictMode: true
};
module.exports = nextConfig;
