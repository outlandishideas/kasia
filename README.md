# Pepperoni

> A React Redux toolset for the WordPress API

## Features

- Declaratively connect React components to the WP-API.
- Register and consume Custom Content Types with ease.
- Built-in isomorphism.

Check out the [Pepperoni boilerplate]() based on [WordPress Bedrock](https://github.com/roots/bedrock)
if you are starting from scratch.

## Requirements

- React >0.14 ??????
- Redux
- Redux Saga
- WordPress w/ [WP-API](http://v2.wp-api.org/) plugin
- [`isomorphic-fetch`](https://github.com/matthew-andrews/isomorphic-fetch)*
<p></p>
_\* isomorphic applications only_

## Install

`npm install pepperoni --save`

## Import

Import the main configuration function:

```js
// ES6
import pepperoni from 'pepperoni'
```

```js
// non-ES6
var pepperoni = require('pepperoni')
```

Pepperoni has other exports, listed in the [API](#API) documentation.

## Configure

Two small steps for man, one huge leap for a pizza topping.

1. Create and spread the Pepperoni reducer when composing your the root reducer.

2. Spread the Pepperoni sagas when composing the saga middleware.

```js
import { combineReducers, createStore, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import Pepperoni from 'pepperoni'

const { pepperoniReducer, pepperoniSagas } = Pepperoni({
  wpApiUrl: 'https://example.com/wp-api/v2/'
})

const rootReducer = combineReducers({
  ...pepperoniReducer
})

const sagaMiddleware = createSagaMiddleware(
  ...pepperoniSagas
)

export default function configureStore (initialState) {
  return createStore(
    rootReducer,
    initialState,
    applyMiddleware(sagaMiddleware)
  )
}
```

## Connect a Component

After configuration you can connect a component in order that it receives content
data via `props` by decorating that component with `connectWordPress`.

For example, using a connected component as a `react-router` router handler we can provide a function
to pick a subject identifier from the `params` property:

```js
import React, { Component } from 'react'
import { Route } from 'react-router'
import connectWordPress from 'pepperoni/connect'

@connectWordPress((props) => props.params.slug)
export default class Post extends Component {
  render () {
    const { post } = this.props

    if (!post) {
      return <span>Loading...</span>
    }

    return <h1>{post.title}</h1>
  }
}

// Somewhere else in a module far far away...
// [imports, boilerplate, ...]

export default (
  <Route component={Post} path="/:slug" />
)
```

## The Shape of Data

__Pepperoni restructures data returned from the WP-API__.

> Why?

The JSON returned from WP-API contains such things as objects with a single property (e.g. objects with `rendered`),
property names prefixed with an underscore (e.g. `_links`), and most importantly it does not by default embed content
types within one another without the use of the `_embed` query parameter.

> What changes should I be aware of?

- __The `_embed` query parameter is enabled by default in Pepperoni.__

    The primary reason for this is to reduce the number of requests made to the WP-API as it is very common
    to not only want content data, but also any metadata such as authors.

    This can be disabled during configuration or for an individual component by
    declaring `{ useEmbedQuery: false }` in the options object.

    ```js
    // Disable `_embed` query parameter during configuration
    const { pepperoniReducer, pepperoniSagas } = Pepperoni({ useEmbedQuery: false })

    // Disable `_embed` query parameter at the component-level
    connectWordPress(/*args*/, { useEmbedQuery: false })(Component)
    ```

- All property names are camel-cased.

    ```js
    "featured_media" => "featuredMedia"
    ```

- Objects that have a single property `'rendered'` are flattened.

    ```js
    {
      content: {
        rendered: '<h1>Hello, World!</h1>'
      }
    }

    //=>

    { content: '<h1>Hello, World!</h1>' }
    ```

- Wherever a nested content type appears under `_embedded` that content type is flattened into the parent. It is also
lifted into the store as a separate entity and so can be accessed independently of the parent content.

    So in the following instance, both the post and user (authors are users) become available in their respective
    collections within the store.

   ```js
    {
      id: 10,
      author: 50,
      embedded: {
        author: { id: 50, name: "Special Agent Pepperoni" }
      }
    }

    //=>

    {
      posts: {
        '10': {
          id: 10,
          author: { id: 50, name: "Special Agent Pepperoni" }
        }
      },
      authors: {
        '50': { id: 50, name: "Special Agent Pepperoni" }
      }
    }
  ```

## API

### `pepperoni(options) : Object`

Configure Pepperoni.

Returns an object containing the Pepperoni reducer and sagas.

```js
const { pepperoniReducer, pepperoniSagas } = Pepperoni({
  host: 'http://website.com'
})
```

The required `options` object accepts properties:

- `host` (required)

    The host of the WP-API.

    ```js
    // Example host
    { host: 'http://website.com' }
    ```

- `wpApiUrl` (optional) (default: `'wp-json/wp/v2'`)

    The location of the WP-API.

    ```js
    // Example WP-API URL
    { wpApiUrl: 'wp-json/wp/v2' }
    ```

- `customContentTypes` (optional) (default: `[]`)

    An array of custom content type definitions.

    ```js
    // Example custom content types
    { customContentTypes: ['Book', 'Article'] }
    ```

    A custom content type can be an `Object` or a `String`.

    When a string is given, the `requestSlug` and `namePlural` are generated automatically.
    The string should be camel-cased. For example, for a custom content type `'CustomUser'`:

        requestSlug === 'custom-users' // string used in WP-API requests
        nameSingle === 'customUser' // string used to namespace single item on component `props`
        namePlural === 'customUsers' // string used to namespace entities in the store

    These properties can be overridden by providing a custom content type as an `Object`.

- `keyEntitiesBy` (optional) (default: `'id'`)

    The property on content from the WP-API that is used to key that content in the store.

    e.g Given `keyEntitiesBy === 'slug'` and a post `{ title: 'My Post', slug: 'my-post' }`
    the post will be available in the store under `wordpress.entities.posts['my-post']`.

### `connectWordPress([options]) : Component`

Connect a component to data from the WP-API.

```js
@connectWordPress(/*contentType, identifier, options*/)
export default class Post extends Component {}

// or, without support for decorators...

class Post extends Component {}
export default connectWordPress(/*contentType, identifier, options*/)(Post)
```

Arguments:

- `contentType` (optional) (default: derived from Component name)

    The name of the content type for which the connected component will receive data.

    When a `contentType` is not given Pepperoni will derive the content type from the component name. e.g.
    A component named `'MyPost'` will automatically use the built-in content type `'Post'`, or a component named
    `'Article'` will use the custom content type `'Article'`, so long as it has been declared at initialisation.

    When passing explicitly, built-in content types are available from `pepperoni/contentTypes` and custom content
    types should be passed in using the `name` they were registered with.

    ```js
    import { Post } from 'pepperoni/contentTypes'

    // Example explicit built-in content type
    // Requests a post with derived ID
    connectWordPress(Post, (props) => props.params.postId)(Component)

    // Example derived content type
    // Makes request for a page with the 'homepage' slug
    connectWordPress('homepage')(HomePage)

    // Example explicit custom content type
    // Makes request for an article with ID of `43`
    connectWordPress('Articles', 34)(Component)
    ```


-----

Pepperoni delivers the data to you straight out of WordPress by default. We have found this data to be excessively nested and this to be a problem. Therefore if you set up as follows, you will receive information from the WordPress API in a lightly restructured format that makes it easier to handle in Javascript - for example keys are camel-cased and nesting is reduced. See [below](#) for how this data is structured internal to Redux store.

```js
pepperoniReducers = createPepperoniReducers({
  api: 'https://example.com/wp-api/v2/',
  restructureData: true
})
```

Sometimes you might not want to make these assumptions. `connectToWordPress` accepts a number of possible arguments to explicitly tell Pepperoni what data is wanted from WordPress REST API.

```js
// Connect to WordPress
connectToWordPress({
  routeParamsPropName: 'params.slug', //  From which property on the component's props will the route parameters be derived?
  type 'post', // The type of thing to get from WordPress - can be any provided by WordPress API - e.g. post, page, taxonomy and so on
  mapStateToProps: someFunction // A custom version of Redux's mapStateToProps that will be passed the store so you can perform your own mapping here.
  useEmbedRequestQuery: true // - on by default, should WordPress REST API
  extraActionInfo: {
  	something: 'blah'
  } // Extra action into to be merged when dispatcher is called to make fetch from WordPress (or a function to add extra action info)
})(MyPost)
```

### Getting Data Directly

Sometimes, for example when you are using WordPress as a data store, not as a simple CMS, you might want to fetch data directly.

You can do this by dispatching the action handlers that under the hood are responsible for making the fetches.

For example, if we wanted to fetch a post for our own component.

```js
import React, { Component } from 'react'

import { connectToWordPressDirectly } from 'pepperoni'
import { fetchPost } from 'pepperoni/action'

class MyComponent extends Component {
  componentDidMount() {
    const { dispatch, id } = this.props

    dispatch(fetchPost(id))

    this.handleClick = this.handleClick.bind(this)
  }

  handleOnClick() {
    const { dispatch, id } = this.props

    dispatch(fetchPost(10))
  }

  render() {
    const { post } = this.props

    if (!post) {
      return (<div>Loading</div>)
    }

    return (
      <div>
        {post.title.rendered}
        <button onClick={this.handleClick}>Click to make this another post</button>
      </div>
    )
  }
}

function mapStateToProps(state, ownProps) {
  // [...]
 }

connectToWordPressDirectly(mapStateToProps)(MyPost)
```

`connectToWordPressDirectly` is a sugar over `react-redux`'s `connect` method. If you are already performing a `connect` with Redux there is no need to do anything more.

For simple mapping of state to props we provide an example implementation of `mapStateToProps`. This can just be turned on in the simple case with the following and props will be returned simply as the `this.props[type]`:

```js
import React, { Component } from 'react'

import { connectToWordPressDirectly } from 'pepperoni'
import { fetchPost } from 'pepperoni/action'

class MyComponent extends Component {
  componentDidMount() {
    const { dispatch, id } = this.props

    dispatch(fetchPost(id))
  }

  render() {
    const { post } = this.props

    if (!post) {
      return (<div>Loading</div>)
    }

    return (<div>post.title.rendered</div>)
  }
}

connectToWordPressDirectly({ automap: true })(MyPost)
```

## Components

Pepperoni contains a series of components that can be used for implementing common WordPress style functionality. There are.

[...etc....]

## Porting From A WordPress Theme To React

We provide a [WordPress plugin]() for doing this. It attempts to work out how your theme is structured and outputs WordPress components based on this that can be seen by moving around the site normally.

(quick note on how this could be done - basically the same as any cache - interupt the render on the way out and introspect to work out how it is should look - anything that is something like `header.php` then put it into its own component and so on)

(should this be a WordPress plugin or a command line script to run across the thing in PHP (or JS?)? Parsing PHP is the key factor and maybe the layout of how themes work in WordPress is consistent enough that we could skip out the bit where we have to use WordPress at all. Presumably all the basic WordPress theme functions are well known and documented (the Loop etc) that you could translate stuff across pretty easily)

We've ported the default WordPress theme [Twenty Sixteen]() to React using this tool and a little cleaning up.

## Justification

## Makes Use Of

## Prior Art
