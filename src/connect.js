import React, { Component } from 'react';
import { connect as reduxConnect } from 'react-redux';

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
  return (target) => {
    if (target.__repress) {
      throw new Error(`The component "${target.name}" is already wrapped by Repress.`);
    }

    contentType = contentType || customContentTypes[contentType] || deriveContentType(target.name);

    if (!contentType) {
      throw new Error(
        'Could not derive content type from class name. ' +
        'Pass built-ins using Repress.ContentTypes. For example, ContentTypes.POST. ' +
        'Custom Content Types should be registered with Repress#registerCustomContentType.'
      );
    }

    const isCustomContentType = !!customContentTypes[contentType];
    const camelCaseContentTypeSingular = mapToCamelCase(contentType);
    const camelCaseContentTypePlural = mapToCamelCasePlural(contentType);

    function mapStateToProps (state, ownProps) {
      const params = ownProps[routeParamsPropName];
      const collection = state.$$repress[camelCaseContentTypePlural];
      const value = collection ? collection[params.id] : null;
      return { [camelCaseContentTypeSingular]: value };
    }

    class RepressComponentWrapper extends Component {
      componentWillMount () {
        this.props.dispatch(this.createInitAction());
      }

      createInitAction () {
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
