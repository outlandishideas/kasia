# Kasia Plugin WP-API Response Modify

> Apply wp-api-response-modify to Kasia

Made with ❤ at [@outlandish](http://www.twitter.com/outlandish)

<a href="http://badge.fury.io/js/kasia-plugin-wp-api-response-modify"><img alt="npm version" src="https://badge.fury.io/js/kasia-plugin-wp-api-response-modify.svg"></a>
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Install

```sh
npm install --save kasia-plugin-wp-api-response-modify
```

## Import

```js
// ES2015
import KasiaWpApiResponseModifyPlugin from 'kasia-plugin-wp-api-response-modify'
```

```js
// CommonJS
var KasiaWpApiResponseModifyPlugin = require('kasia-plugin-wp-api-response-modify')
```

## Initialise

Pass to Kasia via the `plugins` option:

```js
const { kasiaReducer, kasiaSagas } = Kasia({
  WP,
  plugins: [KasiaWpApiResponseModifyPlugin]
})
```

```js
// pass in desired effects
const { kasiaReducer, kasiaSagas } = Kasia({
  WP,
  plugins: [
    [KasiaWpApiResponseModifyPlugin, {
      effects: [/*...*/]
    }]
  ]
})
```

## The Shape of Things

With this plugin Kasia restructures the [shape of things](https://www.youtube.com/watch?v=Zn2JFlteeJ0) returned from the WP-API.

The changes made to the data are all effects available in the
[`wp-api-response-modify`](https://github.com/outlandishideas/wp-api-response-modify) library.

### Why?

The JSON returned from WP-API contains such things as objects with a single property (e.g. objects with `rendered`)
and meta data property names prefixed with an underscore (e.g. `_links`).

### What changes should I be aware of?

- All property names are camel-cased.

    ```js
    "featured_media" => "featuredMedia"
    ```

- Links are removed.

    ```js
    { title: 'Wow what an amazing title!', _links: {}, ... }
    // becomes...
    { title: 'Wow what an amazing  title!', ... }
    ```

- Objects that have a single property `'rendered'` are flattened.

    ```js
    { content: { rendered: '<h1>Hello, World!</h1>' }, ... }
    // becomes...
    { content: '<h1>Hello, World!</h1>', ... }
    ```

- Content types are normalised using [`normalizr`](https://github.com/paularmstrong/normalizr).
This means that any embedded content data is made available on the store within its respective content type collection.
For example:

    ```js
    {
      posts: {},
      users: {},
      pages: {},
      news: {}, // custom content type
      ...
    }
    ```

## Contributing

All pull requests and issues welcome!

- When submitting an issue please provide adequate steps to reproduce the problem.
- PRs must be made using the `standard` code style.
- PRs must update the version of the library according to [semantic versioning](http://semver.org/).

If you're not sure how to contribute, check out Kent C. Dodds'
[great video tutorials on egghead.io](https://egghead.io/lessons/javascript-identifying-how-to-contribute-to-an-open-source-project-on-github)!

## Author & License

`kasia-plugin-wp-api-response-modify` was created by [Outlandish](https://twitter.com/outlandish) and is released under the MIT license.
