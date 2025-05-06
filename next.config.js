/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (
    config,
    { isServer, webpack } // Add webpack to the destructured arguments to access webpack.IgnorePlugin
  ) => {
    // Handle node: scheme imports for both client and server
    config.resolve.alias = {
      ...config.resolve.alias,
      // Correct the alias to handle 'node:url' imports
      'node:url': require.resolve('url'), 
    };
    
    // Add IgnorePlugin for pg-hstore as it's not needed for MSSQL
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^pg-hstore$/,
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
    return config;
  },
};

module.exports = nextConfig;