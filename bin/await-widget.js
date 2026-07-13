#!/usr/bin/env node
/* eslint-disable n/prefer-global/buffer, no-bitwise, unicorn/no-array-sort */
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import readline from 'node:readline';

const defaultPort = 4343;
const maxBodyBytes = 100 * 1024 * 1024;
const zipDosTime = 0;
const zipDosDate = 33;
const excludedNames = new Set([
	'node_modules',
	'package.json',
	'package-lock.json',
	'tsconfig.json',
	'xo.config.js',
]);
const excludedSuffixes = ['.lock', '.lockb', '.yaml', '.yml', '.toml'];
const crcTable = makeCrcTable();
const bridgeInfoDirectory = '.await';
const bridgeInfoFileName = 'bridge.json';
const singleWidgetPath = '.';
const widgetDirectoryError = 'Run await-widget from a package root or first-level widget folder whose package.json includes @await-widget/runtime.';

function main() {
	const options = parseArgs(process.argv.slice(2));
	if (options.help) {
		printHelp();
		return;
	}

	if (options.command === 'app') {
		runAppCommand(options).catch(error => {
			console.error(error.message);
			process.exit(1);
		});
		return;
	}

	startWorkspaceServer(options);
}

function parseArgs(args) {
	if (args[0] === 'app') {
		return parseAppArgs(args.slice(1));
	}

	let port = defaultPort;
	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === '--help' || arg === '-h') {
			return {help: true, port};
		}

		if (arg === '--port') {
			port = Number(args[index + 1]);
			index += 1;
			continue;
		}

		printHelp();
		process.exit(1);
	}

	return {command: 'bridge', help: false, port};
}

function parseAppArgs(args) {
	if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
		return {command: 'app', help: true};
	}

	const tool = appCommandName(args[0]);
	let bridgeUrl;
	let workspace;
	const toolArguments = {};
	for (let index = 1; index < args.length; index += 1) {
		const arg = args[index];
		if (arg === '--bridge-url' || arg === '--url') {
			bridgeUrl = args[index + 1];
			index += 1;
			continue;
		}

		if (arg === '--workspace') {
			workspace = args[index + 1];
			index += 1;
			continue;
		}

		if (arg === '--json') {
			Object.assign(toolArguments, JSON.parse(args[index + 1]));
			index += 1;
			continue;
		}

		if (arg === '--widget-id') {
			toolArguments.widgetId = args[index + 1];
			index += 1;
			continue;
		}

		if (arg === '--mode') {
			toolArguments.mode = args[index + 1];
			index += 1;
			continue;
		}

		if (arg === '--timeout-ms') {
			toolArguments.timeoutMs = Number(args[index + 1]);
			index += 1;
			continue;
		}

		if (arg === '--intent-id') {
			toolArguments.intentId = args[index + 1];
			index += 1;
			continue;
		}

		if (arg === '--input') {
			toolArguments.input = JSON.parse(args[index + 1]);
			index += 1;
			continue;
		}

		printHelp();
		process.exit(1);
	}

	return {
		command: 'app', help: false, bridgeUrl, workspace, tool, toolArguments,
	};
}

async function startWorkspaceServer(options) {
	let roots;
	try {
		roots = await resolveWidgetServerRoots(process.cwd());
	} catch (error) {
		console.error(error.message);
		process.exit(1);
	}

	const {packageRoot, widgetRoot} = roots;

	const token = crypto.randomBytes(6).toString('hex');
	const bridge = createBridgeState(widgetRoot);
	const server = http.createServer((request, response) => {
		handleRequest({
			request, response, root: widgetRoot, token, bridge,
		}).catch(error => {
			sendJson(response, {error: error.message}, 500);
		});
	});
	startWorkspaceWatcher(widgetRoot, bridge);
	server.listen(options.port, '0.0.0.0', () => {
		const address = server.address();
		const port = typeof address === 'object' && address ? address.port : options.port;
		writeBridgeInfo(packageRoot, port, token);
		console.log(`Await computer connection serving ${widgetRoot}`);
		printServerUrls(port, token);
		console.log('Press Ctrl+C to stop.');
	});
}

function createBridgeState(root) {
	return {
		events: new Set(),
		activeEvent: undefined,
		pendingCommands: new Map(),
		widgetChangeTimers: new Map(),
		widgetsChangedTimer: undefined,
		knownWidgets: widgetPathKey(listDesktopWidgets(root)),
	};
}

async function handleRequest({request, response, root, token, bridge}) {
	const url = new URL(request.url ?? '/', 'http://localhost');
	if (url.pathname === '/') {
		sendText(response, `Await computer connection\n${urlForRequest(request, token)}\n`);
		return;
	}

	if (url.searchParams.get('token') !== token) {
		sendText(response, 'Forbidden\n', 403);
		return;
	}

	try {
		await routeRequest({
			request, response, root, url, bridge,
		});
	} catch (error) {
		sendJson(response, {error: error.message}, errorStatus(error));
	}
}

async function routeRequest({request, response, root, url, bridge}) {
	if (request.method === 'GET' && url.pathname === '/await-dev/connection') {
		sendJson(response, {
			workspaceName: path.basename(root),
			capabilities: {
				events: true,
				appCommands: true,
				appMcp: true,
				singleWidget: true,
			},
			widgets: listDesktopWidgets(root),
		});
		return;
	}

	if (request.method === 'GET' && url.pathname === '/await-dev/widgets') {
		sendJson(response, {widgets: listDesktopWidgets(root)});
		return;
	}

	if (request.method === 'GET' && url.pathname === '/await-dev/events') {
		addEventClient(bridge, response);
		return;
	}

	if (request.method === 'GET' && url.pathname === '/await-dev/version') {
		const widgetRoot = widgetRootFromQuery(root, url);
		console.log(`Await version requested: ${path.basename(widgetRoot)}`);
		sendJson(response, {
			name: path.basename(widgetRoot),
			path: singleWidgetPath,
			version: projectVersion(widgetRoot),
		});
		return;
	}

	if (request.method === 'GET' && url.pathname === '/await-dev/snapshot.zip') {
		const widgetRoot = widgetRootFromQuery(root, url);
		console.log(`Await snapshot requested: ${path.basename(widgetRoot)}`);
		const archive = zipFiles(scanFiles(widgetRoot));
		response.writeHead(200, {
			'Content-Type': 'application/zip',
			'Content-Length': archive.length,
			'Cache-Control': 'no-store',
		});
		response.end(archive);
		return;
	}

	if (request.method === 'POST' && url.pathname === '/await-dev/app-command') {
		const body = await readJsonBody(request);
		const result = await sendAppCommand(bridge, body.tool, body.arguments ?? {});
		sendJson(response, result);
		return;
	}

	if (request.method === 'POST' && url.pathname === '/await-dev/command-result') {
		const body = await readJsonBody(request);
		completeAppCommand(bridge, body);
		sendJson(response, {ok: true});
		return;
	}

	sendText(response, 'Not Found\n', 404);
}

function addEventClient(bridge, response) {
	response.writeHead(200, {
		'Content-Type': 'text/event-stream',
		'Cache-Control': 'no-store',
		Connection: 'keep-alive',
	});
	response.flushHeaders?.();
	response.write(': connected\n\n');
	console.log('Await app event stream connected.');
	const heartbeat = setInterval(() => {
		response.write(': ping\n\n');
	}, 15_000);
	bridge.events.add(response);
	bridge.activeEvent = response;
	response.on('close', () => {
		clearInterval(heartbeat);
		bridge.events.delete(response);
		if (bridge.activeEvent === response) {
			bridge.activeEvent = [...bridge.events].at(-1);
		}

		console.log('Await app event stream disconnected.');
	});
}

function writeEvent(response, event, data) {
	response.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function sendEvent(bridge, event, data) {
	if (event === 'widgetChanged' || event === 'widgetsChanged') {
		console.log(`Await event ${event}: ${JSON.stringify(data)}`);
	}

	for (const response of bridge.events) {
		writeEvent(response, event, data);
	}
}

function sendAppCommand(bridge, tool, args) {
	if (!bridge.activeEvent) {
		throw errorWithStatus('Await app is not connected.', 503);
	}

	const id = crypto.randomUUID();
	const command = {id, tool, arguments: args};
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			bridge.pendingCommands.delete(id);
			reject(errorWithStatus(`Await app command timed out: ${tool}`, 504));
		}, 15_000);
		bridge.pendingCommands.set(id, {resolve, reject, timer});
		writeEvent(bridge.activeEvent, 'command', command);
	});
}

function completeAppCommand(bridge, body) {
	const id = String(body.id ?? '');
	const pending = bridge.pendingCommands.get(id);
	if (!pending) {
		return;
	}

	clearTimeout(pending.timer);
	bridge.pendingCommands.delete(id);
	if (body.ok === false) {
		pending.reject(errorWithStatus(String(body.error ?? 'Await app command failed.'), 500));
		return;
	}

	pending.resolve(body.result ?? {});
}

function startWorkspaceWatcher(root, bridge) {
	try {
		fs.watch(root, {recursive: true}, (_eventType, filename) => {
			handleWorkspaceFileEvent(root, bridge, filename);
		});
	} catch {
		fs.watch(root, (_eventType, filename) => {
			handleWorkspaceFileEvent(root, bridge, filename);
		});
	}
}

function handleWorkspaceFileEvent(root, bridge, filename) {
	const relativePath = String(filename ?? '').replaceAll('\\', '/');
	const [topLevel] = relativePath.split('/');
	if (topLevel && !isExcludedName(topLevel)) {
		scheduleWidgetChanged(bridge, singleWidgetPath);
	}

	scheduleWidgetsChanged(root, bridge);
}

function scheduleWidgetChanged(bridge, widgetPath) {
	clearTimeout(bridge.widgetChangeTimers.get(widgetPath));
	bridge.widgetChangeTimers.set(widgetPath, setTimeout(() => {
		bridge.widgetChangeTimers.delete(widgetPath);
		sendEvent(bridge, 'widgetChanged', {path: widgetPath});
	}, 250));
}

function scheduleWidgetsChanged(root, bridge) {
	clearTimeout(bridge.widgetsChangedTimer);
	bridge.widgetsChangedTimer = setTimeout(() => {
		const key = widgetPathKey(listDesktopWidgets(root));
		if (key === bridge.knownWidgets) {
			return;
		}

		bridge.knownWidgets = key;
		sendEvent(bridge, 'widgetsChanged', {widgets: listDesktopWidgets(root)});
	}, 250);
}

function widgetPathKey(widgets) {
	return widgets.map(widget => widget.path).sort((left, right) => left.localeCompare(right)).join('\n');
}

function findPackageRoot(start) {
	let current = path.resolve(start);
	while (true) {
		const candidate = path.join(current, 'package.json');
		if (fs.existsSync(candidate)) {
			return current;
		}

		const parent = path.dirname(current);
		if (parent === current) {
			return null;
		}

		current = parent;
	}
}

async function resolveWidgetServerRoots(start) {
	const widgetRoot = path.resolve(start);
	const packageRoot = findPackageRoot(widgetRoot);
	if (
		!packageRoot
		|| !hasRuntimeDependency(packageRoot)
	) {
		throw new Error(widgetDirectoryError);
	}

	if (packageRoot === widgetRoot) {
		return {packageRoot, widgetRoot: await selectWidgetRoot(packageRoot)};
	}

	if (path.dirname(widgetRoot) !== packageRoot || !isValidTopLevelName(path.basename(widgetRoot))) {
		throw new Error(widgetDirectoryError);
	}

	return {packageRoot, widgetRoot};
}

function selectWidgetRoot(packageRoot) {
	const options = [
		{name: `${path.basename(packageRoot)} (root)`, path: packageRoot},
		...fs.readdirSync(packageRoot, {withFileTypes: true})
			.filter(entry => entry.isDirectory() && isValidTopLevelName(entry.name))
			.sort((left, right) => left.name.localeCompare(right.name))
			.map(entry => ({name: entry.name, path: path.join(packageRoot, entry.name)})),
	];
	let selected = 0;
	let rendered = false;
	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);
	process.stdin.resume();
	console.log('Select a directory to connect:');

	const render = () => {
		if (rendered) {
			readline.moveCursor(process.stdout, 0, -options.length);
			readline.clearScreenDown(process.stdout);
		}

		process.stdout.write(`${options.map((option, index) => `${index === selected ? '❯' : ' '} ${option.name}`).join('\n')}\n`);
		rendered = true;
	};
	render();

	return new Promise(resolve => {
		const cleanup = () => {
			process.stdin.off('keypress', onKeypress);
			process.stdin.setRawMode(false);
			process.stdin.pause();
		};
		const onKeypress = (_character, key) => {
			if (key.name === 'up' || key.name === 'down') {
				selected = (selected + (key.name === 'up' ? options.length - 1 : 1)) % options.length;
				render();
				return;
			}

			if (key.name === 'return' || key.name === 'enter') {
				cleanup();
				resolve(options[selected].path);
				return;
			}

			if (key.ctrl && key.name === 'c') {
				cleanup();
				process.exit(130);
			}
		};
		process.stdin.on('keypress', onKeypress);
	});
}

function hasRuntimeDependency(packageRoot) {
	const manifest = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
	return Boolean(manifest.dependencies?.['@await-widget/runtime'] ?? manifest.devDependencies?.['@await-widget/runtime']);
}

function listDesktopWidgets(root) {
	return [{name: path.basename(root), path: singleWidgetPath}];
}

function isExcludedName(name) {
	return name.startsWith('.') || excludedNames.has(name) || excludedSuffixes.some(suffix => name.endsWith(suffix));
}

function widgetRootFromQuery(root, url) {
	const widgetPath = requiredSearchParam(url, 'path');
	return safeWidgetPath(root, widgetPath);
}

function requiredSearchParam(url, name) {
	const value = url.searchParams.get(name);
	if (!value) {
		throw new Error(`Missing ${name}`);
	}

	return value;
}

function safeWidgetPath(root, widgetPath, options = {}) {
	if (widgetPath !== singleWidgetPath) {
		throw new Error(`Invalid widget path: ${widgetPath}`);
	}

	if (!options.allowMissing && !isDirectory(root)) {
		throw errorWithStatus(`Widget directory does not exist: ${widgetPath}`, 404);
	}

	return root;
}

function isValidTopLevelName(name) {
	return Boolean(name) && !name.includes('/') && !name.includes('\\') && !isExcludedName(name);
}

function projectVersion(root) {
	const hash = crypto.createHash('sha256');
	for (const file of scanFiles(root)) {
		hash.update(file.relativePath);
		hash.update('\0');
		hash.update(String(file.size));
		hash.update('\0');
		hash.update(String(file.mtimeMs));
		hash.update('\0');
	}

	return `sha256-${hash.digest('hex')}`;
}

function scanFiles(root) {
	const files = [];
	walk(root, '', files);
	return files;
}

function walk(directory, relativeDirectory, files) {
	const entries = fs.readdirSync(directory, {withFileTypes: true})
		.sort((left, right) => left.name.localeCompare(right.name));
	for (const entry of entries) {
		if (isExcludedName(entry.name)) {
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
		const name = Buffer.from(file.relativePath, 'utf8');
		const data = fs.readFileSync(file.absolutePath);
		const crc = crc32(data);
		const localHeader = Buffer.concat([
			u32(0x04_03_4B_50),
			u16(20),
			u16(0x08_00),
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
			u32(0x02_01_4B_50),
			u16(20),
			u16(20),
			u16(0x08_00),
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
		u32(0x06_05_4B_50),
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

const appCommands = [
	{
		name: 'list-app-widgets',
		usage: 'list-app-widgets',
		description: 'List Await widgets currently stored in the Await app.',
		inputSchema: {type: 'object', properties: {}},
	},
	{
		name: 'open-widget-detail',
		usage: 'open-widget-detail --widget-id <id>',
		description: 'Open a widget detail page in the Await app.',
		inputSchema: {
			type: 'object',
			properties: {widgetId: {type: 'string'}},
			required: ['widgetId'],
		},
	},
	{
		name: 'open-syncing-widget-detail',
		usage: 'open-syncing-widget-detail',
		description: 'Open the widget detail page for the widget currently syncing from this computer.',
		inputSchema: {type: 'object', properties: {}},
	},
	{
		name: 'set-preview-mode',
		usage: 'set-preview-mode --mode <small|medium|large|extraLarge> [--widget-id <id>]',
		description: 'Set the current widget detail preview mode.',
		inputSchema: {
			type: 'object',
			properties: {
				widgetId: {type: 'string'},
				mode: {type: 'string', enum: ['small', 'medium', 'large', 'extraLarge']},
			},
			required: ['mode'],
		},
	},
	{
		name: 'capture-current-preview',
		usage: 'capture-current-preview [--widget-id <id>]',
		description: 'Capture the currently visible widget preview as PNG.',
		inputSchema: {
			type: 'object',
			properties: {widgetId: {type: 'string'}},
		},
	},
	{
		name: 'get-widget-status',
		usage: 'get-widget-status --widget-id <id>',
		description: 'Get App-side status for a widget.',
		inputSchema: {
			type: 'object',
			properties: {widgetId: {type: 'string'}},
			required: ['widgetId'],
		},
	},
	{
		name: 'wait-for-widget-ready',
		usage: 'wait-for-widget-ready --widget-id <id> [--timeout-ms <ms>]',
		description: 'Wait for the current widget preview to have rendered data.',
		inputSchema: {
			type: 'object',
			properties: {
				widgetId: {type: 'string'},
				timeoutMs: {type: 'number'},
			},
			required: ['widgetId'],
		},
	},
	{
		name: 'get-build-errors',
		usage: 'get-build-errors --widget-id <id>',
		description: 'Get recent build errors for a widget.',
		inputSchema: {
			type: 'object',
			properties: {widgetId: {type: 'string'}},
			required: ['widgetId'],
		},
	},
	{
		name: 'get-recent-widget-logs',
		usage: 'get-recent-widget-logs --widget-id <id>',
		description: 'Get recent print logs for a widget. Requires Lifetime Pro in Await.',
		inputSchema: {
			type: 'object',
			properties: {widgetId: {type: 'string'}},
			required: ['widgetId'],
		},
	},
	{
		name: 'list-widget-intents',
		usage: 'list-widget-intents --widget-id <id>',
		description: 'List widget intents registered by a widget.',
		inputSchema: {
			type: 'object',
			properties: {widgetId: {type: 'string'}},
			required: ['widgetId'],
		},
	},
	{
		name: 'call-widget-intent',
		usage: 'call-widget-intent --widget-id <id> --intent-id <id> [--input <json-array>]',
		description: 'Call a widget intent with positional input arguments.',
		inputSchema: {
			type: 'object',
			properties: {
				widgetId: {type: 'string'},
				intentId: {type: 'string'},
				input: {
					type: 'array',
					items: {},
				},
			},
			required: ['widgetId', 'intentId'],
		},
	},
];

function appCommandName(value) {
	if (!appCommands.some(command => command.name === value)) {
		throw new Error(`Unsupported Await app command: ${value}`);
	}

	return value;
}

async function runAppCommand(options) {
	const result = await callAppCommand(resolveBridgeUrl(options), options.tool, options.toolArguments);
	console.log(JSON.stringify(appCommandResult(options, options.tool, result), null, '\t'));
}

function resolveBridgeUrl(options) {
	if (options.bridgeUrl) {
		return options.bridgeUrl;
	}

	const root = findPackageRoot(path.resolve(options.workspace ?? process.cwd()));
	if (!root) {
		throw new Error('Cannot find package.json for Await bridge lookup.');
	}

	return readBridgeUrl(bridgeInfoPath(root));
}

function readBridgeUrl(infoPath) {
	if (!fs.existsSync(infoPath)) {
		throw new Error('Cannot find Await bridge info. Run npx await-widget first.');
	}

	const info = JSON.parse(fs.readFileSync(infoPath, 'utf8'));
	return info.bridgeUrl;
}

async function callAppCommand(bridgeUrl, tool, args) {
	if (!appCommands.some(item => item.name === tool)) {
		throw new Error(`Unsupported Await app command: ${tool}`);
	}

	const url = bridgeEndpoint(bridgeUrl, '/await-dev/app-command');
	const response = await fetch(url, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({tool, arguments: args}),
	});
	const body = await response.json();
	if (!response.ok) {
		throw new Error(body.error ?? `Await bridge request failed: ${response.status}`);
	}

	return body;
}

function appCommandResult(options, tool, result) {
	if (tool === 'capture-current-preview' && result.imageBase64) {
		const filePath = saveCapture(options, result);
		return {...result, imageBase64: undefined, filePath};
	}

	return result;
}

function saveCapture(options, result) {
	const root = findPackageRoot(options.workspace ? path.resolve(options.workspace) : process.cwd()) ?? process.cwd();
	const directory = path.join(root, bridgeInfoDirectory, 'captures');
	const name = safeCaptureFileName(String(result.widgetId ?? 'widget'));
	const filePath = path.join(directory, `${name}-${Date.now()}.png`);
	fs.mkdirSync(directory, {recursive: true});
	fs.writeFileSync(filePath, Buffer.from(result.imageBase64, 'base64'));
	return filePath;
}

function safeCaptureFileName(value) {
	const name = value.replaceAll(/[^\w.-]+/g, '-').replaceAll(/^-+|-+$/g, '');
	return name || 'widget';
}

function bridgeEndpoint(bridgeUrl, pathname) {
	const url = new URL(bridgeUrl);
	url.pathname = pathname;
	return url;
}

async function readJsonBody(request) {
	const body = await readBody(request);
	return JSON.parse(body.toString('utf8'));
}

async function readBody(request) {
	const chunks = [];
	let size = 0;
	for await (const chunk of request) {
		size += chunk.length;
		if (size > maxBodyBytes) {
			throw new Error('Request body too large');
		}

		chunks.push(chunk);
	}

	return Buffer.concat(chunks);
}

function makeCrcTable() {
	const table = new Uint32Array(256);
	for (let index = 0; index < table.length; index += 1) {
		let value = index;
		for (let bit = 0; bit < 8; bit += 1) {
			value = value & 1 ? 0xED_B8_83_20 ^ (value >>> 1) : value >>> 1;
		}

		table[index] = value >>> 0;
	}

	return table;
}

function crc32(data) {
	let crc = 0xFF_FF_FF_FF;
	for (const byte of data) {
		crc = crcTable[(crc ^ byte) & 0xFF] ^ (crc >>> 8);
	}

	return (crc ^ 0xFF_FF_FF_FF) >>> 0;
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

function sendJson(response, value, status = 200) {
	const body = Buffer.from(`${JSON.stringify(value)}\n`);
	response.writeHead(status, {
		'Content-Type': 'application/json',
		'Content-Length': body.length,
		'Cache-Control': 'no-store',
	});
	response.end(body);
}

function errorWithStatus(message, statusCode) {
	const error = new Error(message);
	error.statusCode = statusCode;
	return error;
}

function errorStatus(error) {
	return Number.isInteger(error.statusCode) ? error.statusCode : 500;
}

function sendText(response, value, status = 200) {
	response.writeHead(status, {
		'Content-Type': 'text/plain; charset=utf-8',
		'Cache-Control': 'no-store',
	});
	response.end(value);
}

function printServerUrls(port, token) {
	const {recommended, otherUrls} = serverUrls(port, token);
	if (recommended) {
		console.log('Paste this URL into Await:');
		console.log('');
		console.log(recommended.url);
		console.log('');
	}

	if (otherUrls.length > 0) {
		console.log('Other network interfaces, usually not needed:');
		for (const item of otherUrls) {
			console.log(item.url);
		}
	}
}

function writeBridgeInfo(root, port, token) {
	const {recommended, otherUrls} = serverUrls(port, token);
	const info = {
		workspaceRoot: root,
		workspaceName: path.basename(root),
		port,
		token,
		bridgeUrl: `http://127.0.0.1:${port}?token=${token}`,
		appUrl: recommended?.url,
		urls: [recommended, ...otherUrls].filter(Boolean).map(item => item.url),
		updatedAt: new Date().toISOString(),
	};
	fs.mkdirSync(path.dirname(bridgeInfoPath(root)), {recursive: true});
	fs.writeFileSync(bridgeInfoPath(root), `${JSON.stringify(info, null, '\t')}\n`);
}

function bridgeInfoPath(root) {
	return path.join(root, bridgeInfoDirectory, bridgeInfoFileName);
}

function serverUrls(port, token) {
	const networkUrls = localNetworkUrls(port, token);
	const recommended = networkUrls.find(({address}) => isPrivateIPv4(address)) ?? networkUrls[0];
	return {
		recommended,
		otherUrls: [
			{url: `http://127.0.0.1:${port}?token=${token}`},
			...networkUrls.filter(item => item !== recommended),
		],
	};
}

function localNetworkUrls(port, token) {
	const urls = [];
	for (const interfaces of Object.values(os.networkInterfaces())) {
		for (const item of interfaces ?? []) {
			if (item.family === 'IPv4' && !item.internal) {
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
	const parts = address.split('.').map(Number);
	if (parts.length !== 4 || parts.some(part => !Number.isInteger(part))) {
		return false;
	}

	return parts[0] === 10
		|| (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
		|| (parts[0] === 192 && parts[1] === 168);
}

function urlForRequest(request, token) {
	const host = request.headers.host ?? `127.0.0.1:${defaultPort}`;
	return `http://${host}?token=${token}`;
}

function isDirectory(value) {
	try {
		return fs.statSync(value).isDirectory();
	} catch {
		return false;
	}
}

function printHelp() {
	const commandHelp = appCommands
		.map(command => [
			`  ${command.usage}`,
			`      tool: ${command.name}`,
			`      ${command.description}`,
			`      inputSchema: ${JSON.stringify(command.inputSchema)}`,
		].join('\n'))
		.join('\n');
	console.log(`Usage:
  await-widget [--port ${defaultPort}]
  await-widget app <command> [options]

Start the Await computer connection from a package root or first-level widget
folder whose package.json includes @await-widget/runtime. Starting from the
package root opens a directory selector.

What it does:
  - Serves the selected widget folder to Await for live sync.
  - Prints a URL to paste into Await's Connect Computer sheet.
  - Writes .await/bridge.json in the package root for app commands.
  - Sends one-shot JSON app commands with await-widget app <command>.

Examples:
  npx await-widget
  npx await-widget --port 4344
  npx await-widget app open-syncing-widget-detail
  npx await-widget app wait-for-widget-ready --widget-id YourWidget
  npx await-widget app capture-current-preview --widget-id YourWidget
  npx await-widget app get-recent-widget-logs --widget-id YourWidget

App command options:
  --workspace <path>     Read .await/bridge.json from another package/widget path.
  --bridge-url <url>     Send directly to a bridge URL instead of reading bridge.json.
  --json <json>          Merge raw JSON arguments into the app command.

App commands:
${commandHelp}
`);
}

main();
