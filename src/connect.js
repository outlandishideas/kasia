import React, { Component } from 'react';
import { connect as reduxConnect } from 'react-redux';
import invariant from 'invariant';

import { RequestTypes } from './constants/WpApiEndpoints';
import { createRequest } from './actionCreators';
import { fetchResource } from './sagas';
import { deriveContentType } from './contentTypes';

function findContentTypeOptions (targetName, config, contentType) {
  contentType = contentType || deriveContentType(targetName);

  const contentTypes = config.contentTypes;
  const contentTypeNames = Object.keys(contentTypes);

  let contentTypeOptions = null;

  for (let i = 0; i < contentTypeNames.length; i++) {
    const name = contentTypeNames[i];
    const options = contentTypes[name];

    if (options.name.canonical === contentType) {
      contentTypeOptions = options;
      break;
    }
  }

  invariant(
    contentTypeOptions,
    'Could not derive content type from class name "%s". ' +
    'Pass built-ins using Pepperoni.ContentTypes. For example, ContentTypes.POST. ' +
    'Custom Content Types should be registered with Pepperoni#registerCustomContentType.',
    targetName
  );

  return contentTypeOptions;
}

/**
 * Connect a component to data from the WP-API.
 * @param {String} [contentType] The content type for which the WP-API request will be made.
 * @param {String} [routeParamsPropName] From which object on props will the WP-API route parameters be derived?
 * @param {Boolean} [routeParamSubjectKey] The key on `params` that will be used as the ID of desired content.
 * @returns {Function}
 */
export default function connectWordPress ({
  contentType = null,
  routeParamsPropName = 'params',
  routeParamSubjectKey = 'id'
} = {}) {
  return target => {
    invariant(
      !target.__pepperoni,
      'The component "%s" is already wrapped by Pepperoni.',
      target.name
    );

    function mapStateToProps (state, ownProps) {
      const config = state.$$pepperoni.config;
      const opts = findContentTypeOptions(target.name, config, contentType);
      const nameSingular = opts.name[RequestTypes.SINGLE];
      const namePlural = opts.name[RequestTypes.PLURAL];
      const params = ownProps[routeParamsPropName];
      const collection = state.$$pepperoni.entities[namePlural];
      const value = collection ? collection[params[routeParamSubjectKey]] : null;

      return {
        $$pepperoni: state.$$pepperoni,
        [nameSingular]: value
      };
    }

    class PepperoniComponentWrapper extends Component {
      componentWillMount () {
        const config = this.props.$$pepperoni.config;
        const opts = findContentTypeOptions(target.name, config, contentType);
        const nameSingular = opts.name[RequestTypes.SINGLE];
        if (!this.props[nameSingular]) {
          this.props.dispatch(this.createRequestAction());
        }
      }

      createRequestAction () {
        const params = this.props[routeParamsPropName];
        return createRequest(contentType, params[routeParamSubjectKey], { params });
      }

      render () {
        return <target {...this.props} />;
      }
    }

    PepperoniComponentWrapper.__pepperoni = true;

    /**
     * Fetch the content data for the `contentType` that the component represents.
     * @param {String} subject The subject identifier (id or slug)
     */
    PepperoniComponentWrapper.fetchData = subject => [
      [fetchResource, {
        contentType,
        subject
      }]
    ];

    return reduxConnect(mapStateToProps)(PepperoniComponentWrapper);
  };
};
