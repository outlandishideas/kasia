# Kasia Plugin WP-API Menus

> Adds support for the WP-API menus to Kasia

Made with ❤ at [@outlandish](http://www.twitter.com/outlandish)

<a href="http://badge.fury.io/js/kasia-plugin-wp-api-menus"><img alt="npm version" src="https://badge.fury.io/js/kasia-plugin-wp-api-menus.svg"></a>
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)

## Install

```sh
npm install --save kasia-plugin-wp-api-menus
```

## Import

```js
// ES2015
import KasiaWpApiMenusPlugin from 'kasia-plugin-wp-api-menus'

// CommonJS
var KasiaWpApiMenusPlugin = require('kasia-plugin-wp-api-menus')
```

## Initialise

Pass to Kasia via the `plugins` option:

```js
const { kasiaReducer, kasiaSagas } = Kasia({
  WP,
  plugins: [KasiaWpApiMenusPlugin]
})
```

## Action creators

```js
import { 
  fetchMenus, fetchMenu, 
  fetchThemeLocations, fetchThemeLocation 
} from 'kasia-plugin-wp-api-menus'
```

Dispatch the returned action objects with `store.dispatch(<action>)`.

### `actions.fetchMenus()`

Get all menus available.

Menus will be available at `store.wordpress.menus`.

### `actions.fetchMenu(id)`

Get a single menu.

- __id__ {String} ID of the menu to fetch

Menu will be available at `store.wordpress.menus[id]`.

### `actions.fetchThemeLocations()`

Get all theme menu locations.

Theme locations will be available at `store.wordpress.menusLocations`.

### `actions.fetchThemeLocation(id)`

Get a single theme menu location.

- __id__ {String} ID of the theme menu location to fetch

Menu will be available at `store.wordpress.menuLocations[id]`.

## Contributing

All pull requests and issues welcome!

- When submitting an issue please provide adequate steps to reproduce the problem.
- PRs must be made using the `standard` code style.
- PRs must update the version of the library according to [semantic versioning](http://semver.org/).

If you're not sure how to contribute, check out Kent C. Dodds'
[great video tutorials on egghead.io](https://egghead.io/lessons/javascript-identifying-how-to-contribute-to-an-open-source-project-on-github)!

## Author & License

`kasia-plugin-wp-api-menus` was created by [Outlandish](https://twitter.com/outlandish) and is released under the MIT license.
