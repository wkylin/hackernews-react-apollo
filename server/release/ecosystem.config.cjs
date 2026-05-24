module.exports = {
  apps: [
    {
      name: 'hackernews-api',
      script: 'dist/index.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '4000',
      },
    },
  ],
}
