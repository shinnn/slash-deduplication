'use strict';

const {createServer} = require('http');
const {promisify} = require('util');
const {readFile} = require('fs');

const {Builder} = require('selenium-webdriver');
const ChromeOptions = require('selenium-webdriver/chrome').Options;
const FirefoxOptions = require('selenium-webdriver/firefox').Options;
const test = require('tape');

const ROOT = 'http://localhost:3001/';
const promisifiedReadFile = promisify(readFile);

const server = createServer(async (req, res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/html');
	res.end(`<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>dedupe-slashes test</title>
	<script>${await promisifiedReadFile(require.resolve('.'), 'utf8')}</script>
</head>
<body></body>
</html>`);
}).listen(3001, () => test('slash-deduplication', async t => {
	const driver = await new Builder()
	.forBrowser('chrome')
	.setChromeOptions(new ChromeOptions().addArguments(
		'--headless',
		'--no-sandbox',
		'--disable-gpu',
		'--window-size=200,200'
	))
	.setFirefoxOptions(new FirefoxOptions().addArguments(
		'-headless',
		'-width',
		'200',
		'-height',
		'200'
	))
	.build();

	await driver.get(ROOT);
	t.equal(
		await driver.getCurrentUrl(),
		ROOT,
		'should not update URL when it doesn\'t include any duplicate slashes.'
	);

	await driver.get(`${ROOT}/a`);
	t.equal(
		await driver.getCurrentUrl(),
		`${ROOT}a`,
		'should dedupe double slashes in the current URL.'
	);

	await driver.navigate().back();
	t.equal(
		await driver.getCurrentUrl(),
		ROOT,
		'should replace the history instead of pushing a new one.'
	);

	await driver.get(`${ROOT}/////a/////b////c/d///`);
	t.equal(
		await driver.getCurrentUrl(),
		`${ROOT}a/b/c/d/`,
		'should dedupe all duplicated slashes in the current URL.'
	);

	await driver.get(`${ROOT}///index.html#h1`);
	t.equal(
		await driver.getCurrentUrl(),
		`${ROOT}index.html#h1`,
		'should keep the original URL fragment.'
	);

	await driver.get(`${ROOT}index.html#a//b`);
	t.equal(
		await driver.getCurrentUrl(),
		`${ROOT}index.html#a//b`,
		'should not dedupe slashes in URL fragment.'
	);

	await driver.get(`${ROOT}///index.html?x=1&y=2`);
	t.equal(
		await driver.getCurrentUrl(),
		`${ROOT}index.html?x=1&y=2`,
		'should keep the original URL parameters.'
	);

	await driver.get(`${ROOT}///index.html?x=1//2`);
	t.equal(
		await driver.getCurrentUrl(),
		`${ROOT}index.html?x=1//2`,
		'should not dedupe slashes in URL parameters.'
	);

	await driver.get(`${ROOT}///index.html#h1?x=1&y=2`);
	t.equal(
		await driver.getCurrentUrl(),
		`${ROOT}index.html#h1?x=1&y=2`,
		'should keep both the original URL fragment and parameters.'
	);

	await Promise.all([
		driver.quit(),
		promisify(server.close.bind(server))()
	]);

	t.end();
}));
