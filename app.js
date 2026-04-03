/**
 * 入口文件 - VLESS 自动修复 + 多协议支持
 */

const path = require('path');
const fs = require('fs');

// 工具函数
const base64 = str => Buffer.from(str).toString('base64');
const readSync = filePath => fs.readFileSync(filePath, 'utf-8');
const writeSync = (filePath, str) => fs.writeFileSync(filePath, str);

// 文件路径
const BUILD_DIR = 'dist';
const ENTRY_FILE = './node.txt';

// 读取节点列表
let str = readSync(ENTRY_FILE);

// 多协议检查器
const checker = item => {
    return (
        item.includes('ss://') ||
        item.includes('ssr://') ||
        item.includes('vmess://') ||
        item.includes('vless://') ||
        item.includes('trojan://') ||
        item.includes('hy2://')
    );
};

// 自动修复 VLESS 节点
const fixVLESS = line => {
    line = line.trim();
    if (!line.startsWith('vless://')) return line;

    let [base, query] = line.split('?');
    query = query || '';

    let params = {};
    query.split('&').forEach(p => {
        if (p.includes('=')) {
            let [k, v] = p.split('=');
            params[k] = v;
        }
    });

    // 自动补齐必需字段
    if (!params['type']) params['type'] = 'ws';
    if (!params['security']) params['security'] = params['tls'] === '1' ? 'tls' : 'none';
    if (!params['encryption']) params['encryption'] = 'none';
    if (!params['host'] && params['peer']) params['host'] = params['peer'];
    if (!params['path']) params['path'] = '/';

    // 重建 query
    let newQuery = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');

    return `${base}?${newQuery}`;
};

// 处理节点列表
let result = str
    .split(/\r?\n/)
    .filter(line => line.trim() && checker(line))
    .map(line => fixVLESS(line))
    .join('\r\n');

// 创建 dist 文件夹（如果不存在）
if (!fs.existsSync(BUILD_DIR)) fs.mkdirSync(BUILD_DIR);

// 写入 base64 订阅
writeSync(path.resolve(__dirname, BUILD_DIR, 'index.html'), base64(result));

console.log('✅ 已生成订阅：dist/index.html (VLESS 自动修复 + 多协议支持)');
