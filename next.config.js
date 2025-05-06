/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (
    config,
    { isServer, webpack }
  ) => {
    // Handle all Node.js built-in modules
    const nodeLibs = {
      'node:url': require.resolve('url'),
      'node:buffer': require.resolve('buffer/'),
      'node:crypto': require.resolve('crypto-browserify'),
      'node:stream': require.resolve('stream-browserify'),
      'node:util': require.resolve('util/'),
      'node:assert': require.resolve('assert/'),
      'node:path': require.resolve('path-browserify'),
      'node:process': require.resolve('process/browser'),
      'node:events': require.resolve('events/'),
      'node:os': require.resolve('os-browserify/browser'),
      // Add other Node.js modules as needed
    };
    
    // Apply all Node.js module aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      ...nodeLibs,
    };
    
    // Ignore pg-hstore and other unnecessary modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(pg-hstore|mariasql|mysql2|tedious|oracledb|sqlite3)$/,
      })
    );

    // Provide polyfills for Node.js globals
    config.plugins.push(
      new webpack.ProvidePlugin({
        process: 'process/browser',
        Buffer: ['buffer', 'Buffer'],
      })
    );

    if (!isServer) {
      config.resolve = {
        ...config.resolve,
        fallback: {
          ...config.resolve?.fallback,
          fs: false,
          net: false,
          tls: false,
          dns: false,
          dgram: false,
          child_process: false,
        },
      };
    }
    
    // Exclude server-only modules from client bundles
    if (!isServer) {
      config.externals = [...(config.externals || []), 'tedious', 'sequelize'];
    }
    
    return config;
  },
  // Add this option to prevent server-only code from being included in client bundles
  experimental: {
    serverComponentsExternalPackages: ['tedious', 'sequelize']
  }
};

module.exports = nextConfig;