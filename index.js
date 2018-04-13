/*!
 * slash-deduplication | ISC (c) Shinnosuke Watanabe
 * https://github.com/shinnn/slash-deduplication
*/
if (location.pathname.indexOf('//') !== -1) {
	history.replaceState(
		{},
		// https://github.com/whatwg/html/issues/2174
		null,
		location.pathname.replace(/\/\/+/g, '/') + location.hash + location.search
	);
}
