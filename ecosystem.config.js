module.exports = {
  apps: [
    {
      name: 'travel-website',
      // Use an absolute cwd in production to avoid ambiguity when PM2 runs from
      // a different working directory. Update this path to match your server
      // deployment directory if different.
      cwd: '/var/www/travel-website',
      script: 'node',
      args: 'node_modules/next/dist/bin/next start -p 3000',
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
        // Ensure uploads are written to the public folder Next/Nginx serves
        UPLOAD_DIR: '/var/www/travel-website/public'
      },
      // Make sure the app restarts on file changes during development; disabled by default in production
      watch: false,
      max_restarts: 5,
      kill_timeout: 3000,
    },
  ],
};
