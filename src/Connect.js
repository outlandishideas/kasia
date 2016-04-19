import React, { Component } from 'react';
import { connect } from 'react-redux';

import { fetchPost } from './sagas';

const $defProp = Object.defineProperty;
const $getPropDesc = Object.getOwnPropertyDescriptor;

export default function repressConnect (options = {
  /** From which property on the component's props will the route parameters be derived? */
  routeParamsPropName: 'params',
  /** Will the request to WP-API be made with the `_embed` query parameter? */
  useEmbedRequestQuery: true,
  /** A function which maps component props to WP-API route parameters. */
  mapPropsToRouteParams: null,
  /** A function which maps component props to WP-API query parameters. */
  mapPropsToQueryParams: null,
  /** Options for dispatch when server-side rendering the component. */
  fetchDataOptions: {},
  /** react-redux connect() decorator argument proxies. */
  connect: {
    mapStateToProps: undefined,
    mapDispatchToProps: undefined,
    mergeProps: undefined,
    connectOptions: undefined
  }
}) {
  return (target) => {
    const { routeParamsPropName, mapDispatchToProps, mergeProps,
      connectOptions, fetchDataOptions } = options.connect;

    const targetKeys = getTargetKeys(target);

    const mapPropsToRouteParams = options.mapPropsToRouteParams
      ? options.mapPropsToRouteParams
      : (props) => ({ id: props.params.id });

    const mapStateToProps = (state, props) => (state) => Object.assign(
      options.connect.mapStateToProps(state),
      { post: mapPropsToRouteParams(props[routeParamsPropName]) }
    );

    const createConnectArgs = (props) => [
      mapStateToProps(props),
      mapDispatchToProps,
      mergeProps,
      connectOptions
    ];

    class IntermediaryRepressComponentWrapper extends Component {
      constructor (props, context) {
        super(props, context);

        const connectArgs = createConnectArgs(props);

        connect(...connectArgs)(target);

        targetKeys.forEach((key) => {
          if (key !== 'constructor') {
            const connectedKeyDescriptor = $getPropDesc(target, key);
            $defProp(this, key, connectedKeyDescriptor);
          }
        });
      }
    }

    // TODO implement and import fetchPage saga
    IntermediaryRepressComponentWrapper.fetchData = () => [fetchPost, {
      slug: target.constructor.name,
      ...fetchDataOptions
    }];

    return IntermediaryRepressComponentWrapper;
  };
};

// TODO move into util folder
function getTargetKeys (target) {
  if (typeof Reflect !== 'undefined' && typeof Reflect.ownKeys === 'function') {
    return Reflect.ownKeys(target.prototype);
  } else {
    const keys = Object.getOwnPropertyNames(target.prototype);
    return typeof Object.getOwnPropertySymbols === 'function'
      ? keys.concat(Object.getOwnPropertySymbols(target.prototype))
      : keys;
  }
}
