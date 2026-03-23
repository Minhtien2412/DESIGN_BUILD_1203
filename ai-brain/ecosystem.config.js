module.exports = {
  apps: [
    {
      name: "ai-orchestrator-api",
      script: "dist/main.js",
      cwd: "/srv/ai-brain/current",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      env: {
        NODE_ENV: "production",
        PORT: 8088,
      },
      error_file: "/srv/ai-brain/logs/ai-orchestrator-error.log",
      out_file: "/srv/ai-brain/logs/ai-orchestrator-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      exp_backoff_restart_delay: 1000,
    },
    {
      name: "openclaw-gateway",
      script: "openclaw-server",
      cwd: "/srv/openclaw",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        HOST: "127.0.0.1",
        PORT: 18789,
      },
      error_file: "/srv/ai-brain/logs/openclaw-error.log",
      out_file: "/srv/ai-brain/logs/openclaw-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
      exp_backoff_restart_delay: 1000,
    },
  ],
};
