'use strict';

const {createServer} = require('http');
const {promisify} = require('util');
const {readFile} = require('fs');

const {Builder} = require('selenium-webdriver');
const ChromeOptions = require('selenium-webdriver/chrome').Options;
const FirefoxOptions = require('selenium-webdriver/firefox').Options;
const startCase = require('lodash/startCase');
const test = require('tape');

const ROOT = 'http://127.0.0.1:3001/';
const promisifiedReadFile = promisify(readFile);

(async () => {
	const html = Buffer.from(`<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<title>slash-deduplication test</title>
	<script>${await promisifiedReadFile(require.resolve('.'), 'utf8')}</script>
</head>
<body></body>
</html>`);

	const server = createServer((req, res) => {
		res.writeHead(200, {
			'content-type': 'text/html',
			'content-length': html.length
		});
		res.end(html);
	});

	const [driver] = await Promise.all([
		new Builder()
		.forBrowser('chrome')
		.setChromeOptions(new ChromeOptions().headless().addArguments(...process.env.TRAVIS ? ['--no-sandbox'] : []))
		.setFirefoxOptions(new FirefoxOptions().headless())
		.build(),
		promisify(server.listen.bind(server))(3001)
	]);

	test(`slash-deduplication on ${startCase((await driver.getCapabilities()).getBrowserName())}`, async t => {
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
	});
})();
