import React, { Component } from 'react';
import { connect } from 'react-redux';

import { createRequest } from './actionCreators';
import { fetchResource } from './sagas';

export default function repressConnect ({
  /** The WP-API subject type that the component should receive data for, e.g. post, page, etc. */
  subjectType = 'post',
  /** From which property on the component's props will the route parameters be derived? */
  routeParamsPropName = 'params',
  /** Will the request to WP-API be made with the `_embed` query parameter? */
  useEmbedRequestQuery = true,
  /** Object to merge with the action that is dispatched in order to request post data. */
  fetchDataOptions = {}
} = {}) {
  return (target) => {
    if (target.__repress) {
      throw new Error(`The component "${target.name}" is already wrapped by Repress.`);
    }

    function repressMapStateToProps (state, ownProps) {
      const params = ownProps[routeParamsPropName];
      const collection = state.repress[subjectType];

      return collection
        ? { [subjectType]: collection[subjectType][params.id] }
        : { [subjectType]: null };
    }

    class RepressComponentWrapper extends Component {
      componentWillMount () {
        this.props.dispatch(createRequest(subjectType, {
          params: this.props[routeParamsPropName],
          options: { subjectType, useEmbedRequestQuery, fetchDataOptions }
        }));
      }

      render () {
        return <target {...this.props} __repress={true} />;
      }
    }

    RepressComponentWrapper.__repress = true;

    RepressComponentWrapper.fetchData = () => [
      [fetchResource, subjectType, fetchDataOptions]
    ];

    return connect(repressMapStateToProps)(RepressComponentWrapper);
  };
};
