# Kasia Plugin WP-API All Terms

> Adds support for the [WP-API all terms plugin](https://wordpress.org/plugins/wp-rest-api-all-terms/) to Kasia

Made with ❤ at [@outlandish](http://www.twitter.com/outlandish)

<a href="http://badge.fury.io/js/kasia-plugin-wp-api-all-terms"><img alt="npm version" src="https://badge.fury.io/js/kasia-plugin-wp-api-all-terms.svg"></a>
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Install

```sh
npm install --save kasia-plugin-wp-api-all-terms
```

## Import

```js
// ES2015
import KasiaWpApiAllTermsPlugin from 'kasia-plugin-wp-api-all-terms'

// CommonJS
var KasiaWpApiAllTermsPlugin = require('kasia-plugin-wp-api-all-terms')
```

## Initialise

Pass to Kasia via the `plugins` option:

```js
const { kasiaReducer, kasiaSagas } = Kasia({
  WP,
  plugins: [KasiaWpApiAllTermsPlugin]
})
```

## Actions

Import:

```js
import { fetchTerms } from 'kasia-plugin-wp-api-all-terms'
```

### `fetchTerms()`

Get all terms available.

Terms will be available at `store.wordpress.terms`, for example:

```js
{
  categories: [{
    term_id: 3
  }],
  tags: [{
    term_id: 16
  }],
  technologies: [{
    term_id: 15
  }]
}
```

## Universal Applications

```js
import { makePreloader } from 'kasia-plugin-wp-api-all-terms'
```

### `makePreloader(WP)`

- __WP__ {Object} WP API instance

Returns a single saga generator.

## Contributing

All pull requests and issues welcome!

- When submitting an issue please provide adequate steps to reproduce the problem.
- PRs must be made using the `standard` code style.
- PRs must update the version of the library according to [semantic versioning](http://semver.org/).

If you're not sure how to contribute, check out Kent C. Dodds'
[great video tutorials on egghead.io](https://egghead.io/lessons/javascript-identifying-how-to-contribute-to-an-open-source-project-on-github)!

## Author & License

`kasia-plugin-wp-api-all-terms` was created by [Outlandish](https://twitter.com/outlandish) and is released under the MIT license.
