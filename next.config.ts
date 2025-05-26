import { NextConfig } from 'next';

const nextConfig: NextConfig = {
    allowedDevOrigins: ['192.168.0.62', '192.168.56.1','192.168.1.11'],
    experimental: {
        // other experimental features go here
    },
}

export default nextConfig;