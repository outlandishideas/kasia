# kasia

> A React Redux toolset for the WordPress API

Made with ❤ at [@outlandish](http://www.twitter.com/outlandish)

<a href="http://badge.fury.io/js/kasia"><img alt="npm version" src="https://badge.fury.io/js/kasia.svg"></a>
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
<a href="https://travis-ci.org/outlandishideas/kasia"><img alt="travis ci build" src="https://travis-ci.org/outlandishideas/kasia.svg""></a>
<a href="https://coveralls.io/repos/github/outlandishideas/kasia/badge.svg?branch=master"><img alt="coverage" src="https://coveralls.io/repos/github/outlandishideas/kasia/badge.svg?branch=master"></a>

Get data from WordPress and into components with ease...

```js
// e.g. Get a Post by its slug
@connectWpPost(Post, 'spongebob-squarepants')
function SpongebobSquarepants (props) {
  const { post: spongebob } = props.kasia

  return spongebob
    ? <h1>{spongebob.title}</h1> //=> Spongebob Squarepants
    : <span>Loading...</span>
}
```

## Features

- Declaratively connect React components to data from WordPress.
- Uses [`node-wpapi`](https://github.com/WP-API/node-wpapi) internally in order to facilitate complex queries.
- Register and consume Custom Content Types with ease.
- All WP data is normalised at `store.wordpress`, e.g. `store.wordpress.pages`.
- Support for universal applications.
- Support for plugins, e.g. [`wp-api-menus`](https://github.com/outlandishideas/kasia-plugin-wp-api-menus).

Check out the [Kasia boilerplate](https://github.com/outlandishideas/kasia-boilerplate)!

## Glossary

- [Requirements](#requirements)
- [Install](#install)
- [Import](#import)
- [__Configure__](#configure)
- [__Usage__](#usage)
- [Exports](#exports)
- [The Shape of Things](#the-shape-of-things)
- [Plugins](#plugins)
- [Universal Applications](#universal-applications)
- [Author & License](#author-&-license)

## Requirements

Kasia suits applications that are built using these technologies:

- React
- Redux
- Redux Sagas (>= 0.10.0)
- WordPress
- [WP-API plugin](http://v2.wp-api.org/)
- [`node-wpapi`](https://github.com/WP-API/node-wpapi)

## Install

`npm install kasia --save`

## Import

```js
// ES2015
import Kasia from 'kasia'
```

```js
// CommonJS
var Kasia = require('kasia')
```

## Configure

Configure Kasia in three steps:

1. Initialise Kasia with an instance of `node-wpapi`.

2. Spread the Kasia reducer when creating the redux root reducer.

3. Run the Kasia sagas after creating the redux-saga middleware.

A slimline example...

```js
import { combineReducers, createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import Kasia from 'kasia'
import wpapi from 'wpapi'

const WP = new wpapi({ endpoint: 'http://wordpress/wp-json' })

const { kasiaReducer, kasiaSagas } = Kasia({ WP })

const rootSaga = function * () {
  yield [...kasiaSagas]
}

const rootReducer = combineReducers({
  ...kasiaReducer
})

const sagaMiddleware = createSagaMiddleware()

export default function configureStore (initialState) {
  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(sagaMiddleware)
  )
  
  sagaMiddleware.run(rootSaga)

  return store
}
```

## Usage

Things to keep in mind:

- A component will make a request for data 1) when it mounts and 2) if its props change. For `connectWpPost` a change
in props will trigger Kasia to try and find entity data for the new identifier in the store. If it is found, no request
is made.
- Content data should be parsed before being rendered as it may contain encoded HTML entities.
- In arbitrary queries with `connectWpQuery`, we suggest that you always call the `embed` method on the
query chain, otherwise embedded content data will be omitted from the response.
- Paging data for the request made on behalf of the component is available at `this.props.kasia.query.paging`.
- The examples given assume the use of [decorators.](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy)
However decorator support is not necessary. See the end of each example for the alternative Higher Order Component approach.

### `@connectWpPost(contentType, identifier) : Component`

Connect a component to a single entity in WordPress, e.g. Post, Page, or custom content type. 

- __contentType__ {String} The content type to fetch
- __identifier__ {String|Number|Function} ID of the entity to fetch or function that derives it from `props`

Returns a connected component.

Example, using identifier derived from route parameter on `props`:

```js
import React, { Component } from 'react'
import { Route } from 'react-router'
import { connectWpPost } from 'kasia/connect'
import { Page } from 'kasia/types'

@connectWpPost(Page, (props) => props.params.slug)
export default class Page extends Component {
  render () {
    const { query, page } = this.props.kasia

    if (!query.complete) {
      return <span>Loading...</span>
    }

    return <h1>{page.title}</h1>
  }
}

// Without decorator support
export default connectWpPost(Page, (props) => props.params.slug)(Post)
```

### `@connectWpQuery(queryFn[, propsComparatorFn]) : Component`

Connect a component to the result of an arbitrary WP-API query.

- __queryFn__ {Function} Function that accepts args `wpapi` and `props` and should return a WP-API query
- __propsComparatorFn__ {Function} _(optional)_ Function that determines if new data should be requested by inspecting props

Returns a connected component.

By default the component will request new data via the given `queryFn` if the `propsComparatorFn` returns true.
The default property comparison behaviour is to diff primitive values on the props objects.

Entities returned from the query will be placed on `this.props.kasia.entities` under the same
normalised structure as described in [The Shape of Things](#the-shape-of-things).

Example, fetching the most recent "News" entities:

```js
import React, { Component } from 'react'
import { Route } from 'react-router'
import { connectWpPost } from 'kasia/connect'

// Note the invocation of `embed` in the query chain
@connectWpQuery((wpapi, props) => {
  return wpapi.news().month(props.month).embed().get()
})
export default class RecentNews extends Component {
  render () {
    const {
      query,
      entities: { news }
    } = this.props.kasia

    if (!query.complete) {
      return <span>Loading...</span>
    }

    return (
      <div>
        <h1>Recent News Headlines</h1>
        {Object.keys(news).map((key) =>
          <h2>{news[key].title}</h2>)}
      </div>
    )
  }
}

// Without decorator support
export default connectWpQuery((wpapi) => {
  return wpapi.news().embed().get()
})(Post)
```

### `Kasia(options) : Object`

Configure Kasia.

- __options__ {Object} Options object

Returns an object containing the Kasia reducer and sagas.

```js
const { kasiaReducer, kasiaSagas } = Kasia({
  WP: new wpapi({ endpoint: 'http://wordpress/wp-json' })
})
```

The `options` object accepts:

- `WP` {wpapi}

    An instance of `node-wpapi`.

- `keyEntitiesBy` {String} _(optional)_ (default `'id'`)

    Property of entities used to key them in the store

- `contentTypes` {Array} _(optional)_

    Array of custom content type definitions

    ```js
    // Example custom content type definition
    contentTypes: [{
      name: 'book',
      plural: 'books',
      slug: 'books',
      route, // optional, default="/{plural}/(?P<id>)"
      namespace, // optional, default="wp/v2"
      methodName // optional, default={plural}
    }]
    ```

- `plugins` {Array} _(optional)_

    Array of Kasia plugins.

    ```js
    import KasiaWpApiMenusPlugin from 'kasia-plugin-wp-api-menus'

    // Example passing in plugin
    plugins: [
        [KasiaWpApiMenusPlugin, { route: 'menus' }], // with configuration
        KasiaWpApiMenusPlugin, // without configuration
    ]
    ```

## Exports

### `kasia`

The Kasia configurator.

```js
import Kasia from 'kasia'
```

### `kasia/connect`

The connect decorators.

```js
import { connectWpPost, connectWpQuery } from 'kasia/connect'
```

### `kasia/types`

The built-in WordPress content types that can be passed to `connectWpPost` to define what content type
a request should be made for.

```js
import {
  Category, Comment, Media, Page,
  Post, PostStatus, PostType,
  PostRevision, Tag, Taxonomy, User
} from 'kasia/types'
```

### `kasia/util`

Utility methods to help you when building your application.

At the moment it just exports a function `makePreloaderSaga`, see [Universal Applications](#universal-applications) for more details.

```js
import { makePreloaderSaga } from 'kasia/util'
```

## The Shape of Things

Kasia restructures the [shape of things](https://www.youtube.com/watch?v=Zn2JFlteeJ0) returned from the WP-API.

The changes made to the data are all effects available in the
[`wp-api-response-modify`](https://github.com/outlandishideas/wp-api-response-modify) library.

### Why?

The JSON returned from WP-API contains such things as objects with a single property (e.g. objects with `rendered`), 
meta data property names prefixed with an underscore (e.g. `_links`), and

### What changes should I be aware of?

- Queries initiated by `connectWpPost` will always request embedded data.

    The primary reason for this is to reduce the number of requests made to the WP-API as it is very common
    to not only want content data, but also any metadata such as authors.

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

## Plugins

Kasia exposes a simple API for third-party plugins.

A plugin should:

- be a function that accepts these arguments:
    - __WP__ {wpapi} An instance of `wpapi`
    - __pluginOptions__ {Object} The user's options for the plugin
    - __kasiaOptions__ {Object} The user's options for Kasia

- return an object containing `reducers` (Object) and `sagas` (Array).

- use the `'kasia/'` action type prefix.

```js
// Example definition returned by a plugin
{
  reducer: {
    'kasia/SET_DATA': function setDataReducer () {}
    'kasia/REMOVE_DATA': function removeDataReducer () {}
  },
  sagas: [function * fetchDataSaga () {}]
}
```

See [kasia-plugin-wp-api-menus]() for an example implementation of a Kasia plugin.

## Universal Applications 

### `makePreloaderSaga(components, renderProps) : Generator`

Create a single saga operation that will preload all data for any Kasia components in `components`.

- __components__ {Array} Array of components
- __renderProps__ {Object} Render props object derived from the matched route

Returns a saga operation.

A somewhat contrived example:

```js
import { match } from 'react-router'
import { makePreloaderSaga } from 'kasia/util'

// Our application's react-router routes
import routes from './routes'

// Configures the redux store with saga middleware
// and enhances it with the `runSaga` method
import store from './store'

// Takes the components and render props from matched route, and
// the store state and produces the complete HTML as a string
import renderToString from './render'

// Produce a static webpage and send to the client for the given `route`
export function preload (res, route) { 
  return match({ routes, location: route })
    .then((error, redirectLocation, renderProps) => {
      if (error) {
        res.sendStatus(500)
        return
      }
        
      if (redirectLocation) {
        res.redirect(302, redirectLocation.pathname + redirectLocation.search)
        return
      }
        
      const preloader = makePreloaderSaga(renderProps.components, renderProps)
        
      return store
        .runSaga(preloader).done
        .then(() => renderToString(components, renderProps, store.getState()))
        .then((document) => res.send(document))
    })
}
```

### `ConnectedComponent.makePreloader(renderProps) : Array<Array>`

Connected components expose a static method `makePreloader` that produces an array of saga operations
to facilitate the request for entity data on the server ("preloaders").

Create an array of preloader operations.

- __renderProps__ {Object} Render props object derived from the matched route 

Returns an array of saga operations in the form:

```js
// Saga operations
[ [sagaGeneratorFn, action] ]
```

Elements:

- `sagaGenerator` {Function} Must be called with the `action`

- `action` {Object} An action object containing information for the saga to fetch data

## Contributing

All pull requests and issues welcome! 

- When submitting an issue please provide adequate steps to reproduce the problem.
- PRs must be made using the `standard` code style.
- PRs must update the version of the library according to [semantic versioning](http://semver.org/).

If you're not sure how to contribute, check out Kent C. Dodds'
[great video tutorials on egghead.io](https://egghead.io/lessons/javascript-identifying-how-to-contribute-to-an-open-source-project-on-github)!

## Author & License

`kasia` was created by [Outlandish](https://twitter.com/outlandish) and is released under the MIT license.

