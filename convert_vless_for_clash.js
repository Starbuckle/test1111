const fs = require('fs');
const path = require('path');

// 输入输出文件
const INPUT_FILE = './node.txt';
const OUTPUT_FILE = './node_clash.txt';

// 读取节点
let content = fs.readFileSync(INPUT_FILE, 'utf-8');

// 按行处理
let lines = content.split(/\r?\n/);

const isVLESS = line => line.trim().startsWith('vless://');

const fixVLESSForClash = line => {
    line = line.trim();
    if (!isVLESS(line)) return line;

    let [base, query] = line.split('?');
    query = query || '';

    let params = {};
    query.split('&').forEach(p => {
        if (p.includes('=')) {
            let [k, v] = p.split('=');
            params[k] = v;
        }
    });

    // 去掉 Shadowrocket 特有参数
    const shadowParams = ['xtls', 'pbk', 'sid', 'allowInsecure', 'tls'];
    shadowParams.forEach(p => delete params[p]);

    // 补齐必需字段
    if (!params['type']) params['type'] = 'ws';
    if (!params['security']) params['security'] = 'tls';
    if (!params['encryption']) params['encryption'] = 'none';
    if (!params['host'] && params['peer']) params['host'] = params['peer'];
    if (!params['path']) params['path'] = '/';

    // 重建 query
    let newQuery = Object.entries(params)
        .map(([k, v]) => `${k}=${v}`)
        .join('&');

    return `${base}?${newQuery}`;
};

// 处理节点
let fixedLines = lines.map(line => {
    line = line.trim();
    if (line && isVLESS(line)) {
        return fixVLESSForClash(line);
    }
    return line;
});

// 写入文件
fs.writeFileSync(OUTPUT_FILE, fixedLines.join('\n'), 'utf-8');

console.log(`✅ 已生成 ClashMeta 可识别的 VLESS 节点文件: ${OUTPUT_FILE}`);
