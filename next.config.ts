import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    allowedDevOrigins: ['192.168.0.62', '192.168.56.1'],
    experimental: {
        // other experimental features go here
    },
}

export default nextConfig;