import React, { Component } from 'react';

import getTargetKeys from './utils/getTargetKeys';
import { fetchPost } from './sagas';

export default function repressConnect (options = {
  /** From which property on the component's props will the route parameters be derived? */
  routeParamsPropName: 'params',
  /** Will the request to WP-API be made with the `_embed` query parameter? */
  useEmbedRequestQuery: true,
  /** Options for dispatch when server-side rendering the component. */
  fetchDataOptions: {}
}) {
  return (Target) => {
    const targetKeys = getTargetKeys(Target);

    class RepressComponentWrapper extends Component {
      constructor (props, context) {
        super(props, context);
      }
    }

    RepressComponentWrapper.fetchData = () => [fetchPost, {
      slug: Target.name,
      ...options.fetchDataOptions
    }];

    targetKeys.forEach((key) => {
      if (key !== 'constructor') {
        const targetKeyDescriptor = Object.getOwnPropertyDescriptor(Target.prototype, key);
        Object.defineProperty(RepressComponentWrapper.prototype, key, targetKeyDescriptor);
      }
    });

    return RepressComponentWrapper;
  };
};
