# slash-deduplication

[![npm version](https://img.shields.io/npm/v/slash-deduplication.svg)](https://www.npmjs.com/package/slash-deduplication)
[![Build Status](https://travis-ci.org/shinnn/slash-deduplication.svg?branch=master)](https://travis-ci.org/shinnn/slash-deduplication)
[![Build status](https://ci.appveyor.com/api/projects/status/l4rkad954eljld39/branch/master?svg=true)](https://ci.appveyor.com/project/ShinnosukeWatanabe/slash-deduplication/branch/master)

<img src="./screencast.gif" align="right" width="350" />

Deduplicate multiple consecutive slashes in a current URL without reloading a page

## Installation

[Use](https://docs.npmjs.com/cli/install) [npm](https://docs.npmjs.com/getting-started/what-is-npm).

```
npm install slash-deduplication
```

## Usage

Once the HTML page loads [the script](./index.js) and if the current `location.pathname` includes multiple consecutive `/`, it [replaces](https://developer.mozilla.org/en-US/docs/Web/API/History_API#Adding_and_modifying_history_entries) the current URL with a duplicate-`/`-free one.

```javascript
(async () => {
  location.href; //=> 'https://example.org/a//b/c//d////'
  await import('slash-deduplication');
  location.href; //=> 'https://example.org/a/b/c/d/'
})();
```

It only modifies the path of URL. Original fragment identifier and parameters are preserved.

```javascript
(async () => {
  location.href; //=> 'https://example.org////////page#a//b&c=d//e'
  await import('slash-deduplication');
  location.href; //=> 'https://example.org/page#a//b&c=d//e'
})();
```

This library is suitable for static site hosting service where server-side redirection is not user-unconfigurable, for example [GitHub Pages](https://pages.github.com/).

## License

[ISC License](./LICENSE) © 2018 Shinnosuke Watanabe
