<p align="center">
    <img src="https://raw.githubusercontent.com/outlandishideas/kasia/master/assets/tophat.png" />
</p>

<p><h1 align="center">kasia</h1></p>

<p align="center">A React Redux toolset for the WordPress API</p>

<p align="center">Made with ❤ at <a href="http://www.twitter.com/outlandish">@outlandish</a></p>

<p align="center">
    <a href="http://badge.fury.io/js/kasia"><img alt="npm version" src="https://badge.fury.io/js/kasia.svg" /></a>
    <a href="http://standardjs.com/"><img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" /></a>
    <a href="https://travis-ci.org/outlandishideas/kasia"><img alt="travis ci build" src="https://travis-ci.org/outlandishideas/kasia.svg" /></a>
    <a href='https://coveralls.io/github/outlandishideas/kasia?branch=master'><img src='https://coveralls.io/repos/github/outlandishideas/kasia/badge.svg?branch=master' alt='Coverage Status' /></a>
</p>

<hr/>

<p align="center">
  <strong>
  v4 introduces breaking changes. Please read the <a href="https://github.com/outlandishideas/kasia/blob/master/CHANGELOG.md">CHANGELOG</a> for more details.
  </strong>
</p>

<hr/>

:sparkles: We welcome contributors!

:vertical_traffic_light: Issues are triaged using a traffic light system:

&nbsp;&nbsp;&nbsp;![#00ff00](http://placehold.it/15/00ff00/000000?text=+) <strong>[small](https://github.com/outlandishideas/kasia/issues?q=is%3Aopen+is%3Aissue+label%3Asmall)</strong> - quick tasks, great for beginner contributors<br/>
&nbsp;&nbsp;&nbsp;![#ffff00](http://placehold.it/15/ffff00/000000?text=+) <strong><span style="color: yellow;">[medium](https://github.com/outlandishideas/kasia/issues?q=is%3Aopen+is%3Aissue+label%3Amedium)</span></strong> - tasks with increased complexity, may take some time to implement<br/>
&nbsp;&nbsp;&nbsp;![#ff0000](http://placehold.it/15/ff0000/000000?text=+) <strong>[large](https://github.com/outlandishideas/kasia/issues?q=is%3Aopen+is%3Aissue+label%3Alarge)</strong> - big tasks that touch many parts of the library, will require commitment

[Get started contributing here.](https://github.com/outlandishideas/kasia/issues)

<hr/>

Get data from WordPress and into components with ease...

```js
// e.g. Get a post by its slug
@connectWpPost('post', 'spongebob-squarepants')
export default class extends React.Component () {
  render () {
    const { post: spongebob } = this.props.kasia
    
    if (!spongebob) {
      return <p>{'Who lives in a pineapple under the sea?'}</p>
    }
    
    return <h1>{spongebob.title.rendered}!</h1>
    //=> Spongebob Squarepants!
  }
}
```

## Features

- Declaratively connect React components to data from WordPress.
- Uses [`node-wpapi`](https://github.com/WP-API/node-wpapi) in order to facilitate complex queries.
- Register and consume Custom Content Types with ease.
- All WP data is normalised at `store.wordpress`, e.g. `store.wordpress.pages`.
- Plugin API, e.g. [`wp-api-menus`](https://github.com/outlandishideas/kasia/tree/master/packages/kasia-plugin-wp-api-menus).
- Supports universal applications.

## Glossary

- [Extra Docs](#docs)
- [Requirements](#requirements)
- [Install](#install)
- [Import](#import)
- [__Configure__](#configure)
- [__Usage__](#usage)
- [Exports](#exports)
- [Plugins](#plugins)
- [Universal Applications](#universal-applications)
- [Draft Posts](#draft-posts)
- [Contributing](#contributing)
- [Author & License](#author-&-license)

## Docs

See the [`docs/` folder](https://github.com/outlandishideas/kasia/tree/master/docs) for extra documentation.

## Requirements

Kasia suits applications that are built using these technologies:

- React
- Redux
- Redux Sagas (>= 0.10.0)
- WordPress
- [WP-API plugin](http://v2.wp-api.org/)
- [`node-wpapi`](https://github.com/WP-API/node-wpapi)

## Install

```sh
npm install kasia --save
```

```sh
yarn add kasia
```

## Import

```js
// ES2015
import kasia from 'kasia'
```

```js
// CommonJS
var kasia = require('kasia')
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
import kasia from 'kasia'
import wpapi from 'wpapi'

const wpai = new wpapi({ endpoint: 'http://wordpress/wp-json' })

const { kasiaReducer, kasiaSagas } = kasia({ wpapi })

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

### `kasia(options) : Object`

Configure Kasia.

- __options__ {Object} Options object

Returns an object containing the Kasia reducer and sagas.

```js
const { kasiaReducer, kasiaSagas } = kasia({
  wpapi: new wpapi({ endpoint: 'http://wordpress/wp-json' })
})
```

The `options` object accepts:

- `wpapi` {wpapi}

    An instance of `node-wpapi`.
    
- `keyEntitiesBy` {String} _(optional, default=`'id'`)_

    Property of entities that is used to key them in the store.
     
    One of: `'slug'`, `'id'`.
    
- `debug` {Boolean} _(optional, default=`false`)_

  Log debug information to the console.

- `contentTypes` {Array} _(optional)_

    Array of custom content type definitions.

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
    import kasiaWpApiMenusPlugin from 'kasia-plugin-wp-api-menus'

    // Example passing in plugin
    plugins: [
        [kasiaWpApiMenusPlugin, { route: 'menus' }], // with configuration
        kasiaWpApiMenusPlugin, // without configuration
    ]
    ```
    
### Decorators

Things to keep in mind:

- A component will make a request for data 1) when it mounts and 2) if its props change. For `connectWpPost` a change
in props will trigger Kasia to try and find entity data for the new identifier in the store. If it is found, no request
is made.
- Content data should be parsed before being rendered as it may contain encoded HTML entities.
- In arbitrary queries with `connectWpQuery`, we suggest that you always call the `embed` method on the
query chain, otherwise embedded content data will be omitted from the response.
- Paging data for the request made on behalf of the component is available at `this.props.kasia.query.paging`.
- The examples given assume the use of [decorators (sometimes called annotations)](https://github.com/loganfsmyth/babel-plugin-transform-decorators-legacy).
However decorator support is not necessary. 
See the end of each example for the alternative Higher Order Component approach.

#### `@connectWpPost(contentType, identifier) : Component`

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

#### `@connectWpQuery(queryFn[, shouldUpdate]) : Component`

Connect a component to the result of an arbitrary WP-API query. Query is always made with `?embed` query parameter.

- __queryFn__ {Function} Function that accepts args `wpapi`, `props`, `state` and should return a WP-API query
- __shouldUpdate__ {Function} _(optional)_ Called on `componentWillReceiveProps` with args `thisProps`, `nextProps`, `state` (default: `() => false`)

Returns a connected component.

The component will request new data via `queryFn` if `shouldUpdate` returns true.

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
      data: { news }
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

## Exports

### `kasia`

The Kasia configurator and preload utilities.

```js
import kasia, { preload, preloadQuery } from 'kasia'
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

See [Universal Application Utilities](#Utilities) for more details.

## Plugins

Kasia exposes a simple API for third-party plugins.

A plugin should:

- be a function that accepts these arguments:
    - __wpapi__ {wpapi} An instance of `wpapi`
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

A plugin can hook into Kasia's native action types, available at `kasia/lib/constants/ActionTypes`.
All reducers for an action type are merged into a single function that calls each reducer in succession
with the state returned by the previous reducer. This means the order of plugins that touch the same
action type is important.

### Available plugins:

- [`kasia-plugin-wp-api-menus`](https://github.com/outlandishideas/kasia/tree/master/packages/kasia-plugin-wp-api-menus) 
- [`kasia-plugin-wp-api-all-terms`](https://github.com/outlandishideas/kasia/tree/master/packages/kasia-plugin-wp-api-all-terms)
- [`kasia-plugin-wp-api-response-modify`](https://github.com/outlandishideas/kasia/tree/master/packages/kasia-plugin-wp-api-response-modify)

Please create a pull request to get your own added to the list.

## Universal Applications

__Important...__ 

  - __before calling the preloaders for SSR you must call `kasia.rewind()`__
  - __or if you call `runSagas()` from the utilities then this is done for you.__

### Utilities

#### `runSagas(store, sagas) : Promise`

Run a bunch of sagas against the store and wait on their completion.

- __store__ {Object} Redux store enhanced with `runSaga` method
- __sagas__ {Array} Array of functions that accept the store state and return a saga generator

Returns a Promise resolving on completion of all the sagas.

#### `preload(components[, renderProps][, state]) : Generator`

Create a saga operation that will preload all data for any Kasia components in `components`.

- __components__ {Array} Array of components
- [__renderProps__] {Object} _(optional)_ Render props object derived from the matched route
- [__state__] {Object} _(optional)_ Store state

Returns a [saga operation](#saga-operation-signature).

#### `preloadQuery(queryFn[, renderProps][, state]) : Generator`

Create a saga operation that will preload data for an arbitrary query against the WP API.

- __queryFn__ {Function} Query function that returns `node-wpapi` query
- [__renderProps__] {Object} _(optional)_ Render props object
- [__state__] {Object} _(optional)_ Store state

Returns a [saga operation](#saga-operation-signature).

#### `<KasiaConnectedComponent>.preload(renderProps[, state]) : Array<Array>`

Connected components expose a static method `preload` that produces an array of saga operations
to facilitate the request for entity data on the server.

- __renderProps__ {Object} Render props object derived from the matched route 
- [__state__] {Object} _(optional)_ State object (default: `null`) 

Returns an array of [saga operations](#saga-operation-signature).

#### Saga Operation Signature

A saga operation is an array of the form:

```js
[ sagaGeneratorFn, action ]
```

Where:

- `sagaGenerator` Function that must be called with the `action`.

- `action` action Object containing information for the saga to fetch data.

### Example

A somewhat contrived example using the available preloader methods.

```js
import { match } from 'react-router'
import { runSagas, preload, preloadQuery } from 'kasia'

import routes from './routes'
import store from './store'
import renderToString from './render'
import getAllCategories from './queries/categories'

export default function renderPage (res, location) { 
  return match({ routes, location }, (error, redirect, renderProps) => {
    if (error) return res.sendStatus(500)
    if (redirect) return res.redirect(302, redirect.pathname + redirect.search)
    
    // We are using `runSagas` which rewinds for us, but if we weren't then
    // we would call `kasia.rewind()` here instead:
    //
    // kasia.rewind()
    
    // Each preloader accepts the state that may/may not have been modified by
    // the saga before it, so the order might be important depending on your use-case!
    const preloaders = [
      () => preload(renderProps.components, renderProps),
      (state) => preloadQuery(getAllCategories, renderProps, state)
    ]
    
    return runSagas(store, preloaders)
      .then(() => renderToString(renderProps.components, renderProps, store.getState()))
      .then((document) => res.send(document))
  })  
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

`kasia` was created by [Outlandish](https://twitter.com/outlandish) and is released under the MIT license.
