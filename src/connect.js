import React, { Component } from 'react';
import { connect as reduxConnect } from 'react-redux';
import invariant from 'invariant';
import find from 'lodash.find';

import Plurality from './constants/Plurality';
import { createRequest } from './creators';
import { fetchResource } from './sagas';
import { deriveContentTypeOptions } from './contentTypes';

/**
 * Connect a component to data from the WP-API.
 * @param {String} [contentType] The content type for which the WP-API request will be made.
 * @param {String} [routeParamsPropName] From which object on props will the WP-API route parameters be derived?
 * @param {Boolean} [routeParamSubjectKey] The key on `params` that will be used as the identifier of desired content.
 * @returns {Function}
 */
export default function connectWordPress ({
  contentType,
  routeParamsPropName = 'params',
  routeParamSubjectKey = 'id'
} = {}) {
  return target => {
    const targetName = target.displayName
      ? target.displayName
      : target.name;

    invariant(
      !target.__pepperoni,
      'The component "%s" is already wrapped by Pepperoni.',
      targetName
    );

    const getContentTypeOptions = contentTypes => {
      return typeof contentType === 'undefined'
        ? deriveContentTypeOptions(targetName, contentTypes)
        : contentTypes[contentType];
    };

    function mapStateToProps (state, ownProps) {
      const { contentTypes } = state.wordpress.config;

      const contentTypeOpts = getContentTypeOptions(contentTypes);
      const nameSingular = contentTypeOpts.name[Plurality.SINGULAR];
      const namePlural = contentTypeOpts.name[Plurality.PLURAL];

      const subjectId = ownProps[routeParamsPropName][routeParamSubjectKey];
      const contentTypeCollection = state.wordpress.entities[namePlural];

      const props = { wordpress: state.wordpress };

      if (contentTypeCollection) {
        props[nameSingular] = routeParamSubjectKey !== 'id'
          ? find(contentTypeCollection, obj => obj[routeParamSubjectKey] === subjectId)
          : contentTypeCollection[subjectId];
      }

      return props;
    }

    class PepperoniComponentWrapper extends Component {
      componentWillMount () {
        this.ensureData();
      }

      componentWillUpdate  () {
        this.ensureData();
      }

      ensureData () {
        const { contentTypes } = this.props.wordpress.config;

        const params = this.props[routeParamsPropName];
        const subjectId = params[routeParamSubjectKey];

        const contentTypeOpts = getContentTypeOptions(contentTypes);
        const nameSingular = contentTypeOpts.name[Plurality.SINGULAR];
        const canonicalName = contentTypeOpts.name.canonical;

        if (!this.props[nameSingular]) {
          const action = createRequest(canonicalName, subjectId, { params });
          this.props.dispatch(action);
        }
      }

      render () {
        return React.createElement(target, this.props);
      }
    }

    PepperoniComponentWrapper.__pepperoni = true;

    PepperoniComponentWrapper.fetchData = (renderProps, store) => {
      const { contentTypes } = store.wordpress.config;
      const contentTypeOptions = getContentTypeOptions(contentTypes);
      const contentType = contentTypeOptions.name.canonical;
      const subject = renderProps[routeParamsPropName][routeParamSubjectKey];

      return [[fetchResource, { contentType, subject }]];
    };

    return reduxConnect(mapStateToProps)(PepperoniComponentWrapper);
  };
};
