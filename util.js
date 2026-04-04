const util = require('./util')

// node.txt 里每行一个 URL
let nodes = util.readSync('./node.txt').split('\n').filter(Boolean)

let clashNodes = nodes.map(url => {
    if (url.startsWith('ssr://')) {
        // 原来的 SSR 逻辑
        return parseSSR(url)
    } else if (url.startsWith('vless://')) {
        // 新增 VLESS 解析逻辑
        return parseVLESS(url)
    }
}).filter(Boolean)

// 输出 YAML
util.writeSync('./output.yaml', generateClashYAML(clashNodes))

// ---------------------------

// 解析 VLESS URL 并生成 Clash 节点对象
function parseVLESS(url) {
    try {
        // 解析 URL
        let u = new URL(url)
        let node = {
            name: u.hash ? u.hash.substring(1).replace(/[^\w\-]/g,'_') : 'VLESS_Node',
            type: 'vless',
            server: u.hostname,
            port: parseInt(u.port),
            uuid: u.username,
            flow: u.searchParams.get('flow') || '',
            tls: u.searchParams.get('security') === 'reality' ? true : false,
            network: u.searchParams.get('type') || 'tcp',
            sni: u.searchParams.get('sni') || '',
            pbk: u.searchParams.get('pbk') || '',
            fp: u.searchParams.get('fp') || 'chrome'
        }
        return node
    } catch(e) {
        console.error('解析 VLESS 失败', url, e)
        return null
    }
}

// 生成 YAML 字符串
function generateClashYAML(nodes) {
    const yaml = require('js-yaml')
    return yaml.dump({
        proxies: nodes,
        proxyGroups: [],
        rules: []
    })
}
