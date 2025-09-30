module.exports = {
  apps: [
    {
      name: 'travel-website',
      cwd: __dirname,
      script: 'node',
      args: 'node_modules/next/dist/bin/next start -p 3000',
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      // Make sure the app restarts on file changes during development; disabled by default in production
      watch: false,
      max_restarts: 5,
      kill_timeout: 3000,
    },
  ],
};
