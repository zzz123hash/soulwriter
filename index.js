/**
 * SoulWriter - Main Entry
 * 启动核心，加载插件
 */

const { start, pluginManager, events } = require('./core');

const PORT = process.env.PORT || 3000;

// 加载内置 CLI 插件
const cliPlugin = {
  name: 'cli',
  version: '1.0.0',
  apiVersion: '1.0',
  routes: []
};

// 加载 AI 模型插件（预留）
const aiPlugin = {
  name: 'ai-models',
  version: '1.0.0',
  apiVersion: '1.0',
  routes: []
};

// 启动
async function main() {
  console.log('SoulWriter v1.0.0 - AI Novel Writing Assistant\n');
  
  // 加载插件
  await pluginManager.load(cliPlugin);
  await pluginManager.load(aiPlugin);
  
  // 启动服务器
  await start(PORT);
  
  console.log('\nPlugins loaded:', pluginManager.list());
  console.log('\nReady! Press Ctrl+C to stop.');
}

main().catch(err => {
  console.error('Failed to start:', err);
  process.exit(1);
});
