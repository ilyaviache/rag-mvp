module.exports = {
  apps: [
    {
      name: 'rag-mvp',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: '/home/deploy/apps/rag-mvp/current',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    }
  ]
};
