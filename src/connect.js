import React, { Component } from 'react';
import { connect } from 'react-redux';

import ContentTypes, { mapToCamelCase, mapToCamelCasePlural } from './constants/ContentTypes';
import { createRequest } from './actionCreators';
import { fetchResource } from './sagas';

const contentTypeNames = Object.keys(ContentTypes);

function deriveContentType (targetName) {
  for (let i = 0; i < contentTypeNames.length; i++) {
    const contentTypeName = contentTypeNames[i];
    if (targetName.toLowerCase().includes(contentTypeName.toLowerCase())) {
      return contentTypeName;
    }
  }
}

export default function repressConnect ({
  /** The subject type for which the WP-API request will be made. */
  contentType = null,
  /** From which property on the component's props will the WP-API route parameters be derived? */
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

    if (!(contentType = contentType || deriveContentType(target))) {
      throw new Error('Could not derive content type from class name. Pass a content type explicitly.');
    }

    const isCustomContentType = !contentTypeNames.includes(contentType);
    const camelCaseContentTypeSingular = mapToCamelCase(contentType);
    const camelCaseContentTypePlural = mapToCamelCasePlural(contentType);

    function repressMapStateToProps (state, ownProps) {
      const params = ownProps[routeParamsPropName];
      const collection = state.repress[camelCaseContentTypePlural];
      const value = collection ? collection[params.id] : null;
      return { [camelCaseContentTypeSingular]: value };
    }

    class RepressComponentWrapper extends Component {
      componentWillMount () {
        this.props.dispatch(createRequest(contentType, {
          params: this.props[routeParamsPropName],
          contentType,
          useEmbedRequestQuery,
          fetchDataOptions,
          isCustomContentType
        }));
      }

      render () {
        return <target {...this.props} __repress={true} />;
      }
    }

    RepressComponentWrapper.__repress = true;

    RepressComponentWrapper.fetchData = () => [
      [fetchResource, contentType, fetchDataOptions]
    ];

    return connect(repressMapStateToProps)(RepressComponentWrapper);
  };
};
