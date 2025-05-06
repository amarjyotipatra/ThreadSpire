import type { NextConfig } from 'next';
import type webpack from 'webpack';

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'sequelize',
    'tedious',
    'pg-connection-string',
    'pg-hstore',
    'sqlite3',
    'mysql2',
    'oracledb',
    'ibm_db',
    'strong-oracle',
  ],
  webpack: (
    config: webpack.Configuration,
    { isServer }: { isServer: boolean; dev: boolean; dir: string }
  ): webpack.Configuration => {
    if (!isServer) {
      // Ensure server-only modules are not bundled in the client
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          net: false,
          tls: false,
          dns: false,
          child_process: false,
        },
      };
    }
    return config;
  },
};

export default nextConfig;