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
    invariant(
      !target.__pepperoni,
      'The component "%s" is already wrapped by Pepperoni.',
      target.name
    );

    const getContentTypeOptions = contentTypes => {
      return typeof contentType === 'undefined'
        ? deriveContentTypeOptions(target.name, contentTypes)
        : contentTypes[contentType];
    };

    function mapStateToProps (state, ownProps) {
      const { contentTypes } = state.$$pepperoni.config;

      const contentTypeOpts = getContentTypeOptions(contentTypes);
      const nameSingular = contentTypeOpts.name[Plurality.SINGULAR];
      const namePlural = contentTypeOpts.name[Plurality.PLURAL];

      const subjectId = ownProps[routeParamsPropName][routeParamSubjectKey];
      const contentTypeCollection = state.$$pepperoni.entities[namePlural];

      let back;

      if (routeParamSubjectKey != 'id') {
        back = find(contentTypeCollection, a => a[routeParamSubjectKey] === subjectId);
      } else {
        back = contentTypeCollection ? contentTypeCollection[subjectId] : null;
      }

      return {
        $$pepperoni: state.$$pepperoni,
        [nameSingular]: back
      };
    }

    class PepperoniComponentWrapper extends Component {
      constructor (props, context) {
        super(props, context);
      }

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

    PepperoniComponentWrapper.fetchData = (renderProps) => [
      [fetchResource, {
        contentType,
        subject: renderProps[routeParamsPropName][routeParamSubjectKey]
      }]
    ];

    return reduxConnect(mapStateToProps)(PepperoniComponentWrapper);
  };
};
