#!/usr/bin/env node

/**
 * Cloudflare 本地 Cron 提示。
 *
 * 触发时机：`pnpm dev:cloudflare` 在 wrangler dev 前打印；不读取参数、不写文件、不访问网络。
 * 业务意图：Wrangler 默认提示的 scheduled URL 不适合 Workers Static Assets，Renewlet 固定提示 `/__scheduled`。
 */
const localUrl = "http://localhost:8787";
const scheduledCommand = `curl "${localUrl}/__scheduled?cron=*+*+*+*+*"`;

// Wrangler 的默认 /cdn-cgi scheduled 提示会误导 Workers Static Assets 项目；Renewlet 本地固定走 --test-scheduled 注入的 /__scheduled。
console.log([
  "",
  "Renewlet Cloudflare local dev",
  `  Worker: ${localUrl}`,
  `  Manual Cron: ${scheduledCommand}`,
  "  Expected response: Ran scheduled event",
  "  Do not use /cdn-cgi/handler/scheduled here; Workers Static Assets may return a bare exception.",
  "",
].join("\n"));
