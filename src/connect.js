import React, { Component } from 'react';
import { connect } from 'react-redux';

import ActionTypes from './ActionTypes';
import { fetchPost } from './sagas';

export default function repressConnect ({
  /** The Wordpress post type that the component represents. */
  postType = 'post',
  /** From which property on the component's props will the route parameters be derived? */
  routeParamsPropName = 'params',
  /** Will the request to WP-API be made with the `_embed` query parameter? */
  useEmbedRequestQuery = true,
  /** Object to merge with the action that is dispatched in order to request post data. */
  fetchDataOptions = {},
  /** The collection name for the redux store where items of type `postType` are placed. */
  postTypePlural
} = {}) {
  return (target) => {
    if (target.__repress) {
      throw new Error(`The component "${target.name}" is already wrapped by Repress.`);
    }

    const postTypePlural = postTypePlural || postType + 's';

    const mapStateToProps = function repressMapStateToProps (state, ownProps) {
      const params = ownProps[routeParamsPropName];
      const collection = state.repress[postTypePlural];

      return collection
          ? { [postType]: collection[postTypePlural][params.id] }
          : { [postType]: null };
    };

    class RepressComponentWrapper extends Component {
      componentWillMount () {
        this.props.dispatch({
          type: ActionTypes.REQUEST_POST,
          params: this.props[routeParamsPropName],
          options: { postType, useEmbedRequestQuery, fetchDataOptions }
        });
      }

      render () {
        return <target {...this.props} __repress={true} />;
      }
    }

    RepressComponentWrapper.__repress = true;

    RepressComponentWrapper.fetchData = () => [fetchPost, {
      postType: target.name,
      ...fetchDataOptions
    }];

    return connect(mapStateToProps)(RepressComponentWrapper);
  };
};
