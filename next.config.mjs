/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aldfhmhqvpyozfiwserl.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    domains: ['localhost'],
  },
};

export default nextConfig;
