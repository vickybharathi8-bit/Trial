module.exports = {
  apps: [
    {
      name: "api-practice-backend",
      script: "src/server.js",
      cwd: "/home/ubuntu/api-connection-practice/backend",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "250M",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: 3004
      }
    }
  ]
};
