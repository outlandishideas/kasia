# Pepperoni

> A React Redux toolset for the WordPress API

## Features

- Declaratively connect React components to data from the WordPress API.
- Register and consume Custom Content Types with very little configuration.
- Provides a common sense interface for making requests to the WP-API.
- All content data received is placed on the store for caching (and can be invalidated).
- Built-in isomorphism.
- An official boilerplate for getting started with Pepperoni in a matter of minutes.

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
import pepperoni from 'pepperoni';
```

```js
// non-ES6
var pepperoni = require('pepperoni');
```

Pepperoni has other exports, listed in the [API](#API) documentation.

## Configure

Create and then include the Pepperoni reducer when composing
your application's root reducer with `redux#combineReducers`:

```js
import { combineReducers } from 'redux';
import pepperoni from 'pepperoni';

const pepperoniReducer = pepperoni({
  wpApiUrl: 'https://example.com/wp-api/v2/'
});

const rootReducer = combineReducers({
  ...pepperoniReducer
});

export default rootReducer;
```

Use the root reducer when creating your redux store, passing
in Pepperoni's own sagas to `redux-saga#createSagaMiddleware`.

```js
import { createStore, applyMiddleware } from 'redux';
import { pepperoniSagas } from 'pepperoni';
import createSagaMiddleware from 'redux-saga';

import rootReducer from '../reducers';

export default function configureStore (initialState) {
  const sagaMiddleware = createSagaMiddleware(
    ...pepperoniSagas()
  );

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(sagaMiddleware)
  );

  return store;
}
```

## Built-in Components

Pepperoni comes with ready-made React components for all the built-in content types available through the WP-API.

All children of a built-in component are passed the content data implicitly.

For custom content types, use the `PepperoniComponent` and pass in the content type via the `contentType` prop.

```js
// Available built-in components
import PepperoniComponent, {
  Category, Comment, Media, Page, Post, PostRevision,
  PostType, PostStatus, Tag, Taxonomy, User
} from 'pepperoni/components';
```

Example using the `Page` component:

```js
import { Page } from 'pepperoni/components';

const Title = ({ page }) => {
  return <h1>{page.title}</h1>;
};

const Content = ({ page }) => {
  return <p>{page.content}</p>;
};

export default class MyPage {
  render () {
    return (
      <Page slug="page-slug">
        <Title />
        <Content />
      </Page>
    );
  }
}
```

## Connected Components

After configuration you can connect a component in order that it receives content
data via `props` by decorating that component with `connectWordPress`:

```js
import React, { Component } from 'react';
import { connectWordPress } from 'pepperoni';

class MyPost extends Component {
  render () {
    const { post } = this.props;

    if (!post) {
      return <div>Loading...</div>;
    }

    return <div dangerouslySetInnerHTML={this.props.post.title}></div>;
  }
}

// Connect the component to data from WP-API
export default connectWordPress()(MyPost);
```

## Use a Connected Component

Assuming this post is connected up to [react-router](https://github.com/reactjs/react-router) in the following manner:

```js
import React from 'react';
import { Route, IndexRoute } from 'react-router';

import App from './containers/App';
import Post from './pages/Post';

export default (
 <Route component={App} path="/">
   <IndexRoute component={Home} />
   <Route component={Post} path="/:slug" />
 </Route>
);
```

It will just work. Eventually `MyPost` will receive the post information as `this.props.post`.
If something goes wrong it will receive `this.props.error` which it should handle if required.

The works by simple convention. Anything with `Post` in it is assumed to be a wanted the post post type in WordPress,
anything with `Page` is assumed to be wanting that, anything with `Taxonomy` is assumed to be a taxonomy and so on.
The information from React Router passed as props (for example `slug` or `id`) is assumed to correspond to those
meanings in WordPress REST API generally. You can also override this if neccessary as we will see.

## Ready-made Components

Pepperoni comes with all built-in content types available as ready-made React components.

It also provides a generic `Pepperoni.Component` component that can be configured to receive data for
custom content types.

This API is useful for components that do not depend on configuration received via a router.

```js
const Component,
```

## The Shape of Data

__Pepperoni restructures data returned from the WP-API__.


> Why?

The JSON returned from WP-API contains such things as objects with a single property (e.g. objects with `rendered`),
property names prefixed with underscores (e.g. `_links`) and most importantly it does not by default embed content
types within one another without the use of the `_embed` query parameter.

> What changes should I be aware of?

- __The `_embed` query parameter is enabled by default in Pepperoni.__

- All properties are camel-cased.

    ```js
    "featured_media" => "featuredMedia"
    ```

- All keys of the `links` object are prefixed with `link:`. This is to avoid `normalizr` picking up link objects as entities.

    ```js
    link['author]' => link['link:author']
    ```

- Objects that have a single property `'rendered'` are flattened.

    ```js
    {
      content: {
        rendered: '<h1>Hello, World!</h1>'
      }
    }

    =>

    { content: '<h1>Hello, World!</h1>' }
    ```

- Wherever a nested content type appears under `embedded` that content type is flattened into the parent. It is also
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

    =>

    {
      id: 10,
      author: { id: 50, name: "Special Agent Pepperoni" }
    }
  ```

## API

### `pepperoni(options) : Object`

Configure Pepperoni.

Returns the Pepperoni reducer as an object.

```js
const pepperoniReducer = pepperoni({
  wpApiUrl: 'http://website.com/wp/v2'
});
```

The required `options` object accepts properties:

- `wpApiUrl` (required)

    The location of the WP-API.

    ```js
    // Example WP-API URL
    { wpApiUrl: 'http://website.com/wp/v2' }
    ```

- `customContentTypes` (optional) (default: `[]`)

    An array of custom content type definitions.

    ```js
    // Example custom content types
    { customContentTypes: ['Book', 'Article'] }
    ```

    A custom content type can be an `Object` or a `String`.

    When a string is given, the `requestSlug` and `namePlural` are generated automatically.
    For example, for a custom content type `'CustomUser'`:

        requestSlug === 'custom-users' // string used in WP-API requests
        nameSingle === 'customUser' // string used to namespace single item on component `props`
        namePlural === 'customUsers' // string used to namespace entities in the store

    The above properties are can be overridden by providing a custom content type as an `Object`.

- `entityKeyPropName` (optional) (default: `EntityKeyPropNames.ID`)

    The property on content returned from the WP-API that is used to key that content in the store.

    Available values live in `pepperoni.EntityKeyPropNames` and are `ID` and `SLUG`.

    For example, given a post `{ title: 'My Post', id: '123' }` and `entityKeyPropName === EntityKeyPropNames.ID`
    the post will be available in the store under `posts['123']`.

### `connectWordPress([options]) : Component`

Connect a component to data from the WP-API.

```js
@connectWordPress(/*<options>*/)
class Post extends Component {}

// or, without support for decorators...

class Post extends Component {}
connectWordPress(/*<options>*/)(Post)
```

The optional `options` object accepts properties:

- `contentType` (optional) (default: derived from Component name)

    The name of the content type for which the connected component will receive data.

    When a `contentType` is not given (default) Pepperoni will derive the content type from the component name. e.g.
    A component named `MyCustomPost` will automatically use the registered custom content type `'CustomPost'`.

    When passing explicitly, built-in content types are available at `pepperoni.ContentTypes` and custom content
    types should be passed in using the `name` they were registered with.

    ```js
    // Example explicit built-in content type:
    { contentType: ContentTypes.POST }

    // Example explicit custom content type
    { contentType: 'CustomContentType' }
    ```

- `routeParamsPropName` (optional) (default: `'params'`)

    The property on a component's `props` where route parameters for a request to the WP-API will be derived.
    The default is `'props'`, so folks using `react-router` are not required to configure this option.

    ```js
    // Example overriding route parameters property name
    { routeParamsPropName: 'routeParams' }
    ```

- `routeParamSubjectKey` (optional) (default: `'id'`)

    The property on `props[routeParamsPropName]` where the subject identifier for the request to the
    WP-API will be derived.

    ```js
    // Example overriding route parameters property name
    { routeParamSubjectKey: 'postId' }
    ```

-----

Pepperoni delivers the data to you straight out of WordPress by default. We have found this data to be excessively nested and this to be a problem. Therefore if you set up as follows, you will receive information from the WordPress API in a lightly restructured format that makes it easier to handle in Javascript - for example keys are camel-cased and nesting is reduced. See [below](#) for how this data is structured internal to Redux store.

```js
pepperoniReducers = createPepperoniReducers({
  api: 'https://example.com/wp-api/v2/',
  restructureData: true
});
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
})(MyPost);
```

### Getting Data Directly

Sometimes, for example when you are using WordPress as a data store, not as a simple CMS, you might want to fetch data directly.

You can do this by dispatching the action handlers that under the hood are responsible for making the fetches.

For example, if we wanted to fetch a post for our own component.

```js
import React, { Component } from 'react';

import { connectToWordPressDirectly } from 'pepperoni';
import { fetchPost } from 'pepperoni/action';

class MyComponent extends Component {
  componentDidMount() {
    const { dispatch, id } = this.props;

    dispatch(fetchPost(id));

    this.handleClick = this.handleClick.bind(this);
  }

  handleOnClick() {
    const { dispatch, id } = this.props;

    dispatch(fetchPost(10));
  }

  render() {
    const { post } = this.props;

    if (!post) {
      return (<div>Loading</div>);
    }

    return (
      <div>
        {post.title.rendered}
        <button onClick={this.handleClick}>Click to make this another post</button>
      </div>
    );
  }
}

function mapStateToProps(state, ownProps) {
  // [...]
 }

connectToWordPressDirectly(mapStateToProps)(MyPost);
```

`connectToWordPressDirectly` is a sugar over `react-redux`'s `connect` method. If you are already performing a `connect` with Redux there is no need to do anything more.

For simple mapping of state to props we provide an example implementation of `mapStateToProps`. This can just be turned on in the simple case with the following and props will be returned simply as the `this.props[type]`:

```js
import React, { Component } from 'react';

import { connectToWordPressDirectly } from 'pepperoni';
import { fetchPost } from 'pepperoni/action';

class MyComponent extends Component {
  componentDidMount() {
    const { dispatch, id } = this.props;

    dispatch(fetchPost(id));
  }

  render() {
    const { post } = this.props;

    if (!post) {
      return (<div>Loading</div>);
    }

    return (<div>post.title.rendered</div>);
  }
}

connectToWordPressDirectly({ automap: true })(MyPost);
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
