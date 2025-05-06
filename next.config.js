/** @type {import('next').NextConfig} */
const nextConfig = {
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
    config,
    { isServer }
  ) => {
    if (!isServer) {
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

module.exports = nextConfig;