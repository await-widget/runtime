#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";

const defaultPort = 4343;
const zipDosTime = 0;
const zipDosDate = 33;
const excludedNames = new Set([".git", ".build", "node_modules"]);
const crcTable = makeCrcTable();

function main() {
	const [command, ...args] = process.argv.slice(2);
	if (command === "dev") {
		startDevServer(args);
		return;
	}
	printHelp();
}

function startDevServer(args) {
	const options = parseDevArgs(args);
	const root = path.resolve(options.root);
	const stats = fs.statSync(root);
	if (!stats.isDirectory()) {
		throw new Error(`${root} is not a directory`);
	}

	const token = crypto.randomBytes(6).toString("hex");
	const server = http.createServer((request, response) => {
		handleRequest({request, response, root, token});
	});
	server.listen(options.port, "0.0.0.0", () => {
		const address = server.address();
		const port = typeof address === "object" && address ? address.port : options.port;
		console.log(`Await dev server serving ${root}`);
		printServerUrls(port, token);
		console.log("Press Ctrl+C to stop.");
	});
}

function parseDevArgs(args) {
	let root = ".";
	let port = defaultPort;
	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === "--port") {
			port = Number(args[index + 1]);
			index += 1;
			continue;
		}
		if (arg === "--help" || arg === "-h") {
			printHelp();
			process.exit(0);
		}
		root = arg;
	}
	return {root, port};
}

function handleRequest({request, response, root, token}) {
	const url = new URL(request.url ?? "/", "http://localhost");
	if (url.pathname === "/") {
		sendText(response, `Await dev server\n${urlForRequest(request, token)}\n`);
		return;
	}
	if (url.searchParams.get("token") !== token) {
		sendText(response, "Forbidden\n", 403);
		return;
	}
	if (url.pathname === "/await-dev/version") {
		sendJson(response, {
			name: path.basename(root),
			version: projectVersion(root),
		});
		return;
	}
	if (url.pathname === "/await-dev/snapshot.zip") {
		const archive = zipFiles(scanFiles(root));
		response.writeHead(200, {
			"Content-Type": "application/zip",
			"Content-Length": archive.length,
			"Cache-Control": "no-store",
		});
		response.end(archive);
		return;
	}
	sendText(response, "Not Found\n", 404);
}

function projectVersion(root) {
	const hash = crypto.createHash("sha256");
	for (const file of scanFiles(root)) {
		hash.update(file.relativePath);
		hash.update("\0");
		hash.update(String(file.size));
		hash.update("\0");
		hash.update(String(Math.trunc(file.mtimeMs)));
		hash.update("\0");
	}
	return `sha256-${hash.digest("hex")}`;
}

function scanFiles(root) {
	const files = [];
	walk(root, "", files);
	return files;
}

function walk(directory, relativeDirectory, files) {
	const entries = fs.readdirSync(directory, {withFileTypes: true})
		.sort((left, right) => left.name.localeCompare(right.name));
	for (const entry of entries) {
		if (entry.name.startsWith(".") || excludedNames.has(entry.name)) {
			continue;
		}
		const relativePath = relativeDirectory ? `${relativeDirectory}/${entry.name}` : entry.name;
		const absolutePath = path.join(directory, entry.name);
		if (entry.isDirectory()) {
			walk(absolutePath, relativePath, files);
			continue;
		}
		if (!entry.isFile()) {
			continue;
		}
		const stats = fs.statSync(absolutePath);
		files.push({
			absolutePath,
			relativePath,
			size: stats.size,
			mtimeMs: stats.mtimeMs,
		});
	}
}

function zipFiles(files) {
	const localParts = [];
	const centralParts = [];
	let offset = 0;
	for (const file of files) {
		const name = Buffer.from(file.relativePath, "utf8");
		const data = fs.readFileSync(file.absolutePath);
		const crc = crc32(data);
		const localHeader = Buffer.concat([
			u32(0x04034B50),
			u16(20),
			u16(0x0800),
			u16(0),
			u16(zipDosTime),
			u16(zipDosDate),
			u32(crc),
			u32(data.length),
			u32(data.length),
			u16(name.length),
			u16(0),
			name,
		]);
		localParts.push(localHeader, data);
		centralParts.push(Buffer.concat([
			u32(0x02014B50),
			u16(20),
			u16(20),
			u16(0x0800),
			u16(0),
			u16(zipDosTime),
			u16(zipDosDate),
			u32(crc),
			u32(data.length),
			u32(data.length),
			u16(name.length),
			u16(0),
			u16(0),
			u16(0),
			u16(0),
			u32(0),
			u32(offset),
			name,
		]));
		offset += localHeader.length + data.length;
	}
	const centralDirectory = Buffer.concat(centralParts);
	const end = Buffer.concat([
		u32(0x06054B50),
		u16(0),
		u16(0),
		u16(files.length),
		u16(files.length),
		u32(centralDirectory.length),
		u32(offset),
		u16(0),
	]);
	return Buffer.concat([...localParts, centralDirectory, end]);
}

function makeCrcTable() {
	const table = new Uint32Array(256);
	for (let index = 0; index < table.length; index += 1) {
		let value = index;
		for (let bit = 0; bit < 8; bit += 1) {
			value = value & 1 ? 0xEDB88320 ^ (value >>> 1) : value >>> 1;
		}
		table[index] = value >>> 0;
	}
	return table;
}

function crc32(data) {
	let crc = 0xFFFFFFFF;
	for (const byte of data) {
		crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
	}
	return (crc ^ 0xFFFFFFFF) >>> 0;
}

function u16(value) {
	const buffer = Buffer.allocUnsafe(2);
	buffer.writeUInt16LE(value);
	return buffer;
}

function u32(value) {
	const buffer = Buffer.allocUnsafe(4);
	buffer.writeUInt32LE(value);
	return buffer;
}

function sendJson(response, value) {
	const body = Buffer.from(`${JSON.stringify(value)}\n`);
	response.writeHead(200, {
		"Content-Type": "application/json",
		"Content-Length": body.length,
		"Cache-Control": "no-store",
	});
	response.end(body);
}

function sendText(response, value, status = 200) {
	response.writeHead(status, {
		"Content-Type": "text/plain; charset=utf-8",
		"Cache-Control": "no-store",
	});
	response.end(value);
}

function printServerUrls(port, token) {
	const networkUrls = localNetworkUrls(port, token);
	const recommended = networkUrls.find(({address}) => isPrivateIPv4(address)) ?? networkUrls[0];
	if (recommended) {
		console.log("Paste this URL into Await on iPhone:");
		console.log(recommended.url);
	}
	const otherUrls = [
		{url: `http://127.0.0.1:${port}?token=${token}`},
		...networkUrls.filter(item => item !== recommended),
	];
	if (otherUrls.length > 0) {
		console.log("Other network interfaces, usually not needed:");
		for (const item of otherUrls) {
			console.log(item.url);
		}
	}
}

function localNetworkUrls(port, token) {
	const urls = [];
	for (const interfaces of Object.values(os.networkInterfaces())) {
		for (const item of interfaces ?? []) {
			if (item.family === "IPv4" && !item.internal) {
				urls.push({
					address: item.address,
					url: `http://${item.address}:${port}?token=${token}`,
				});
			}
		}
	}
	return urls;
}

function isPrivateIPv4(address) {
	const parts = address.split(".").map(part => Number(part));
	if (parts.length !== 4 || parts.some(part => !Number.isInteger(part))) {
		return false;
	}
	return parts[0] === 10 ||
		(parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
		(parts[0] === 192 && parts[1] === 168);
}

function urlForRequest(request, token) {
	const host = request.headers.host ?? `127.0.0.1:${defaultPort}`;
	return `http://${host}?token=${token}`;
}

function printHelp() {
	console.log(`Usage:
  await-widget dev [directory] [--port ${defaultPort}]
`);
}

main();
