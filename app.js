/**
 * 入口文件
 */

/**
 * 开发依赖
 */
let path = require('path')
let util = require('./util')
let base64 = util.base64
let readSync = util.readSync
let writeSync = util.writeSync

let BUILD_DIR = 'dist' // 构建目录
let ENTRY_FILE = './node.txt' // 节点入口
let str = readSync(ENTRY_FILE)

// ✅ 扩展协议识别（核心修改点）
let checker = item => {
    return (
        item.includes('ss://') ||
        item.includes('ssr://') ||
        item.includes('vmess://') ||
        item.includes('vless://') ||
        item.includes('trojan://') ||
        item.includes('hy2://') ||
        item.includes('hysteria://') ||
        item.includes('tuic://')
    )
}

// ✅ 保持原逻辑（只做清洗）
let result = str
    .split('\n')
    .map(item => item.trim())
    .filter(item => {
        // 去空行 + 去注释 + 只保留支持协议
        return item && !item.startsWith('#') && checker(item)
    })
    .join('\r\n')

// 写入 base64 订阅
writeSync(
    path.resolve(__dirname, BUILD_DIR, 'index.html'),
    base64(result)
)

console.log("✅ 已生成订阅：dist/index.html")

