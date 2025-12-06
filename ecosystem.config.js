/**
 * PM2 Ecosystem Configuration for Next.js Website
 *
 * Works for both production and staging environments.
 * The app name is set via PM2_APP_NAME environment variable.
 *
 * PM2 provides:
 * - Auto-restart on crash (prevents 504 errors)
 * - Memory limit monitoring (restarts before OOM)
 * - Graceful shutdown/reload
 * - Process monitoring
 *
 * Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [{
    // Dynamic name based on environment (next-website-prod or next-website-staging)
    name: process.env.PM2_APP_NAME || 'next-website',
    script: './server.js',

    // Process management
    instances: 1,
    exec_mode: 'cluster',

    // Auto-restart configuration
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',

    // Memory management - restart before OOM kill
    max_memory_restart: '450M',  // Restart at 450MB (before Docker 512M limit)

    // Restart delay with exponential backoff
    exp_backoff_restart_delay: 100,
    restart_delay: 1000,

    // Environment
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },

    // Logging (Docker handles log collection)
    error_file: '/dev/null',
    out_file: '/dev/null',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

    // Graceful shutdown
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,

    // Advanced options
    watch: false,
    ignore_watch: ['node_modules', 'logs', '.next/cache'],

    // Crash handling
    merge_logs: true,
    combine_logs: true,
  }]
};
