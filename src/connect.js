import React, { Component } from 'react';

import getKeys from './utils/getKeys';
import { fetchPost } from './sagas';

export default function repressConnect (options = {
  /** From which property on the component's props will the route parameters be derived? */
  routeParamsPropName: 'params',
  /** Will the request to WP-API be made with the `_embed` query parameter? */
  useEmbedRequestQuery: true,
  /** Options for dispatch when server-side rendering the component. */
  fetchDataOptions: {}
}) {
  return (target) => {
    const targetKeys = getKeys(target);

    class RepressComponentWrapper extends Component {
      constructor (props, context) {
        super(props, context);

        targetKeys.forEach((key) => {
          if (key !== 'constructor') {
            const targetKeyDescriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
            Object.defineProperty(this, key, targetKeyDescriptor);
          }
        });
      }
    }

    RepressComponentWrapper.fetchData = () => [fetchPost, {
      slug: target.name,
      ...options.fetchDataOptions
    }];

    return RepressComponentWrapper;
  };
};
