/**
 * Util module
 *
 * @author Andy Chung
 * @date  2018-11-05
 */

// Deps
let fs = require('fs')
const { URL } = require('url')

// ===== 原有功能（保留） =====

// Convert normal string to base64 encoding string
let base64 = (str) => {
	return Buffer.from(str).toString('base64')
}

// ReadFile Sync Function
let readSync = (filePath) => fs.readFileSync(filePath).toString('utf-8')

// WriteFile Sync Function
let writeSync = (filePath, str) => fs.writeFileSync(filePath, str)

// ===== 新增：多协议解析 =====

// vmess
function parseVmess(link) {
	try {
		let base = link.replace("vmess://", "")
		let json = Buffer.from(base, 'base64').toString()
		let obj = JSON.parse(json)

		return {
			type: "vmess",
			server: obj.add,
			port: obj.port,
			uuid: obj.id,
			net: obj.net,
			tls: obj.tls
		}
	} catch (e) {
		return null
	}
}

// vless
function parseVless(link) {
	try {
		let u = new URL(link)
		return {
			type: "vless",
			server: u.hostname,
			port: u.port,
			uuid: u.username,
			params: u.search
		}
	} catch (e) {
		return null
	}
}

// trojan
function parseTrojan(link) {
	try {
		let u = new URL(link)
		return {
			type: "trojan",
			server: u.hostname,
			port: u.port,
			password: u.username
		}
	} catch (e) {
		return null
	}
}

// hysteria2
function parseHy2(link) {
	try {
		let u = new URL(link)
		return {
			type: "hy2",
			server: u.hostname,
			port: u.port,
			auth: u.username,
			params: u.search
		}
	} catch (e) {
		return null
	}
}

// 统一入口
function parseExt(link) {
	if (link.startsWith("vmess://")) return parseVmess(link)
	if (link.startsWith("vless://")) return parseVless(link)
	if (link.startsWith("trojan://")) return parseTrojan(link)
	if (link.startsWith("hy2://")) return parseHy2(link)
	return null
}

// ===== 导出 =====
module.exports = {
	base64,
	readSync,
	writeSync,
	parseExt
}
