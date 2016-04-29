import React, { Component } from 'react';
import { connect as reduxConnect } from 'react-redux';
import invariant from 'invariant';
import find from 'lodash.find';

import Plurality from './constants/Plurality';
import { createRequest } from './actionCreators';
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
      const { contentTypes } = state.$$pepperoni.config;

      const contentTypeOpts = getContentTypeOptions(contentTypes);
      const nameSingular = contentTypeOpts.name[Plurality.SINGULAR];
      const namePlural = contentTypeOpts.name[Plurality.PLURAL];

      const subjectId = ownProps[routeParamsPropName][routeParamSubjectKey];
      const contentTypeCollection = state.$$pepperoni.entities[namePlural];

      const props = {
        $$pepperoni: state.$$pepperoni
      };

      if (contentTypeCollection) {
        props[nameSingular] = routeParamSubjectKey !== 'id'
          ? find(contentTypeCollection, obj => obj[routeParamSubjectKey] === subjectId)
          : contentTypeCollection[subjectId];
      }

      return props;
    }

    class PepperoniComponentWrapper extends Component {
      componentWillMount () {
        const { contentTypes } = this.props.$$pepperoni.config;
        const entities = this.props.$$pepperoni.entities;

        const params = this.props[routeParamsPropName];
        const subjectId = params[routeParamSubjectKey];

        const contentTypeOpts = getContentTypeOptions(contentTypes);
        const namePlural = contentTypeOpts.name[Plurality.PLURAL];
        const canonicalName = contentTypeOpts.name.canonical;

        if (
          !entities[namePlural] ||
          entities[namePlural] && !entities[namePlural][subjectId]
        ) {
          this.props.dispatch(
            createRequest(canonicalName, subjectId, { params })
          );
        }
      }

      render () {
        return React.createElement(target, this.props);
      }
    }

    PepperoniComponentWrapper.__pepperoni = true;

    PepperoniComponentWrapper.fetchData = (renderProps, store) => {
      invariant(
        typeof store === 'object',
        'Expecting store to be an object, got "%s". ' +
        'Make sure to pass the result of store#getState.',
        typeof store
      );

      const contentTypeOptions = getContentTypeOptions(store.$$pepperoni.config.contentTypes);
      const contentType = contentTypeOptions.name.canonical;
      const subject = renderProps[routeParamsPropName][routeParamSubjectKey];

      return [[fetchResource, { contentType, subject }]];
    };

    return reduxConnect(mapStateToProps)(PepperoniComponentWrapper);
  };
};
