module.exports = {
  apps: [{
    name: 'bienestar',
    script: './dev-server.js',
    cwd: __dirname,
    env: {
      NODE_ENV: 'production',
      PORT: 3104,
      HOST: '172.18.0.1',
    },
  }],
};
