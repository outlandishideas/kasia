import React, { Component } from 'react';
import { connect as reduxConnect } from 'react-redux';
import invariant from 'invariant';

import ContentTypes, { mapToCamelCase, mapToCamelCasePlural } from './constants/ContentTypes';
import { customContentTypes } from './customContentTypes';
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

function makeContentTypeOptions (contentType) {
  return {
    name: mapToCamelCase(contentType),
    namePlural: mapToCamelCasePlural(contentType)
  };
}

/**
 * Repress connect.
 * TODO write better doc
 * @param {String} [contentType] The subject type for which the WP-API request will be made.
 * @param {String} [routeParamsPropName] From which object on props will the WP-API route parameters be derived?
 * @param {Boolean} [useEmbedRequestQuery] Will the request to WP-API be made with the `_embed` query parameter?
 * @returns {Function}
 */
export default function repressConnect ({
  contentType = null,
  routeParamsPropName = 'params',
  useEmbedRequestQuery = true
} = {}) {
  return target => {
    invariant(
      !target.__repress,
      `The component "${target.name}" is already wrapped by Repress.`
    );

    contentType = contentType ||
      customContentTypes[contentType] ||
      deriveContentType(target.name);

    invariant(
        contentType,
        'Could not derive content type from class name. ' +
        'Pass built-ins using Repress.ContentTypes. For example, ContentTypes.POST. ' +
        'Custom Content Types should be registered with Repress#registerCustomContentType.'
    );

    const isCustomContentType = !!customContentTypes[contentType];

    const contentTypeOptions = isCustomContentType
      ? customContentTypes[contentType]
      : makeContentTypeOptions(contentType);

    function mapStateToProps (state, ownProps) {
      const params = ownProps[routeParamsPropName];
      const collection = state.$$repress[contentTypeOptions.namePlural];
      const value = collection ? collection[params.id] : null;
      return { [contentTypeOptions.name]: value };
    }

    class RepressComponentWrapper extends Component {
      componentWillMount () {
        const params = this.props[routeParamsPropName];
        const collection = this.props[contentTypeOptions.name];
        if (!collection || !collection[params.id]) {
          this.props.dispatch(this.createRequestAction());
        }
      }

      createRequestAction () {
        const contentTypeNamespace = isCustomContentType
          ? ContentTypes.CUSTOM_CONTENT_TYPE
          : contentType;

        return createRequest(contentTypeNamespace, {
          params: this.props[routeParamsPropName],
          contentType,
          useEmbedRequestQuery
        });
      }

      render () {
        return <target {...this.props} />;
      }
    }

    RepressComponentWrapper.__repress = true;

    RepressComponentWrapper.fetchData = () => [
      [fetchResource, contentType]
    ];

    return reduxConnect(mapStateToProps)(RepressComponentWrapper);
  };
};
