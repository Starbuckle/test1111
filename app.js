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

// ✅ 新增：引入解析器
let parseExt = util.parseExt

let BUILD_DIR = 'dist' // 构建目录
let ENTRY_FILE = './node.txt' // 节点入口
let str = readSync(ENTRY_FILE)

// ✅ 支持多协议
let checker = item => {
    return (
        item.includes('ss://') ||
        item.includes('ssr://') ||
        item.includes('vmess://') ||
        item.includes('vless://') ||
        item.includes('trojan://') ||
        item.includes('hy2://')
    )
}

// ✅ 新逻辑：解析 + 兼容旧协议
let lines = str.split('\n')
let nodes = []

lines.forEach(line => {
    line = line.trim()
    if (!checker(line)) return

    // 👉 新协议解析
    let ext = parseExt(line)
    if (ext) {
        console.log("解析成功:", ext)
        nodes.push(JSON.stringify(ext))
        return
    }

    // 👉 老协议（ss / ssr）直接保留
    nodes.push(line)
})

// 拼接
let result = nodes.join('\r\n')

// 写入 base64 订阅
writeSync(
    path.resolve(__dirname, BUILD_DIR, 'index.html'),
    base64(result)
)

console.log("✅ 已生成订阅：dist/index.html")
