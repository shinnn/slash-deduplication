/*!
 * slash-deduplication | ISC (c) Shinnosuke Watanabe
 * https://github.com/shinnn/slash-deduplication
*/
if (location.pathname.indexOf('//') !== -1) {
	history.replaceState({}, document.title, location.pathname.replace(/\/\/+/g, '/') + location.hash + location.search);
}
