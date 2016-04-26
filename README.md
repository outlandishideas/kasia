# Pepperoni

> A React Redux toolset for the WordPress API.

## Features:

- Declaratively connect React components to data from the WordPress API.
- Register and consume Custom Content Types with very little configuration.
- Provides a common sense interface for making requests to the WP-API.
- All content data received is placed on the store for caching (and can be invalidated).
- Built-in isomorphism.
- An official boilerplate for getting started with Pepperoni in a matter of minutes, should you need it.

Behind the scenes Pepperoni uses `redux` and `redux-saga` in order that it can be dropped into any React
Redux application with ease.

Check out the [Pepperoni boilerplate]() based on [WordPress Bedrock](https://github.com/roots/bedrock)
if you are starting from scratch.

## Requirements

- React >0.14 ??????
- A working installation of WordPress.
- The [WP REST API](http://v2.wp-api.org/) plugin installed.
- That's it!

## Install

`npm install pepperoni --save`

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
in Pepperoni's own saga middleware to `redux#applyMiddleware`:

```js
import { createStore, applyMiddleware } from 'redux';
import { createSagaMiddleware } from 'pepperoni';

import rootReducer from '../reducers';

export default function configureStore (initialState) {
  const sagaMiddleware = createSagaMiddleware();

  const store = createStore(
    rootReducer,
    initialState,
    applyMiddleware(sagaMiddleware)
  );

  return store;
}
```

If you are already using `redux-saga` for managing side-effects you don't need to add its middleware to Redux as shown in the `stores/configureStore.js` example.

## Connect a Component

After configuration you can connect a component in order that it receives content data via `props` by decorating
that component with `connectWordPress`:

```js
import React, { Component } from 'react';
import { connectWordPress } from 'pepperoni';

class MyPost extends Component {
  render () {
    const { post } = this.props;

    if (!post) {
      return (<div>Loading</div>);
    }

    return (<div>{post.title.rendered}</div>);
  }
}

// Connect to WordPress
connectWordPress()(MyPost);
```

Assuming this post is connected up to [react-router](https://github.com/reactjs/react-router) in the following manner and the above other work is done:

```js
import React from 'react';

import { Route, IndexRoute } from 'react-router';

import App from './containers/App';

import Post from './pages/Post';

export default
  <Route component={App} path="/">
    <IndexRoute component={Home} />
    <Route component={Post} path="/:slug" />
  </Route>
;
```

It will just work. Eventually `MyPost` will receive the post information as `this.props.post`. If something goes wrong it will receive `this.props.error` which it should handle if required.

The works by simple convention. Anything with `Post` in it is assumed to be a wanted the post post type in WordPress, anything with `Page` is assumed to be wanting that, anything with `Taxonomy` is assumed to be a taxonomy and so on. The information from React Router passed as props (for example `slug` or `id`) is assumed to correspond to those meanings in WordPress REST API generally. You can also override this if neccessary as we will see.

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
