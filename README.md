# RePress

RePress is a set of tools for developing React websites with WordPress via WordPress REST API.

It brings in three things:

- A way of connecting up React components to data from the WordPress API in a simple and seamless way.
- A set of simple components for common elements used in WordPress themes for you to use with this data.
- A boilerplate for writing projects with React and WordPress that provides a quick way into the process.

Behind the scenes RePress is using `redux` alongside `redux-saga` to handle data fetching and management.

You don't need to worry about this however. This complexity is more or less hidden from you and you can just get on with building your site with this data.

## Requirements On The WordPress Side

You need to have a working installation of WordPress that has the [WP REST API](http://v2.wp-api.org/) installed. That's it.

We have a boilerplate for this based on WordPress Bedrock to get you started.

## Requirements On The React Side

We assume that you are using React and [Redux](https://github.com/reactjs/redux) as an implementation of the Flux pattern.

If you want to avoid setting this up yourself we have a boilerplate you can use.

## Using RePress

First grab RePress using `npm`:

`npm install repress --save`

The follow example shows how to add the reducers provided by RePress to the reducers in your application. Examples add RePress to something like the [Redux examples](https://github.com/reactjs/redux/tree/master/examples/universal).

`reducers/index.js`

```js
import { combineReducers } from 'redux'
import { createRePressReducers } from 'repress';

// Is this going to cut it?
repressReducers = createRePressReducers({api: 'https://example.com/wp-api/v2/'});

const rootReducer = combineReducers({
  repressReducers
})

export default rootReducer
```

`stores/configureStore.js`

```js
import { createStore, applyMiddleware } from 'redux';

import { createSagaMiddleware } from 'repress';

import rootReducer from '../reducers'

export default function configureStore(initialState) {
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

### Connecting Whole Components

Decide a component that is going to connect to WordPress and decorate that component with `connectToWordPress`.


```
import React, { Component } from 'react';

import { connectToWordPress } from 'repress';

class MyPost extends Component {
  render() {
    const { post } = this.props;

    if (!post) {
      return (<div>Loading</div>);
    }

    return (<div>{post.title.rendered}</div>);
  }
}

// Connect to WordPress
connectToWordPress()(MyPost);
```

Assuming this post is connected up to [react-router](https://github.com/reactjs/react-router) in the following manner and the above other work is done:

```
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

It will just work. Eventually `MyPost` will recieve the post information as `this.props.post`. If something goes wrong it will recieve `this.props.error` which it should handle if required.

The works by simple convention. Anything with `Post` in it is assumed to be a wanted the post post type in WordPress, anything with `Page` is assumed to be wanting that, anything with `Taxonomy` is assumed to be a taxonomy and so on. The information from React Router passed as props (for example `slug` or `id`) is assumed to correspond to those meanings in WordPress REST API generally. You can also override this if neccessary as we will see.

RePress delivers the data to you straight out of WordPress by default. We have found this data to be expessively nested and this to be a problem. Therefore if you set up as follows, you will recieve information from the WordPress API in a lightly restructed format that makes it easier to handle in Javascript - for example keys are camel-cased and nesting is reduced. See [below](#) for how this data is structured internal to Redux store.

```
repressReducers = createRePressReducers({
  api: 'https://example.com/wp-api/v2/',
  restructureData: true
});
```

Sometimes you might not want to make these assumptions. `connectToWordPress` accepts a number of possible arguments to explicitly tell RePress what data is wanted from WordPress REST API.

```
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

```
import React, { Component } from 'react';

import { connectToWordPressDirectly } from 'repress';
import { fetchPost } from 'repress/action';

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

```
import React, { Component } from 'react';

import { connectToWordPressDirectly } from 'repress';
import { fetchPost } from 'repress/action';

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

RePress contains a series of components that can be used for implementing common WordPress style functionality. There are.

[...etc....]
