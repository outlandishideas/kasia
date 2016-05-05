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
 * @returns {Function}
 */
export default function connectWordPress (contentType, identifier) {
  const deriveContentType = typeof contentType !== 'string';
  const deriveIdentifier = deriveContentType && typeof identifier === 'undefined';

  invariant(
    ['string', 'function'].indexOf(typeof contentType) !== -1,
    'Expecting first argument to be a String or Function, got "%s".',
    typeof contentType
  );

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
      return deriveContentType
        ? deriveContentTypeOptions(targetName, contentTypes)
        : contentTypes[contentType];
    };

    function mapStateToProps (state, ownProps) {
      const { contentTypes, entityKeyPropName } = state.wordpress.config;

      const contentTypeOpts = getContentTypeOptions(contentTypes);
      const nameSingular = contentTypeOpts.name[Plurality.SINGULAR];
      const namePlural = contentTypeOpts.name[Plurality.PLURAL];

      const subjectId = deriveIdentifier
        ? deriveIdentifier(ownProps)
        : identifier;

      const contentTypeCollection = state.wordpress.entities[namePlural];
      const props = { wordpress: state.wordpress };

      if (contentTypeCollection) {
        props[nameSingular] = entityKeyPropName !== 'id'
          ? find(contentTypeCollection, obj => obj[entityKeyPropName] === subjectId)
          : contentTypeCollection[subjectId];
      }

      return props;
    }

    class PepperoniComponentWrapper extends Component {
      render () {
        const { contentTypes } = this.props.wordpress.config;

        const subjectId = deriveIdentifier
          ? deriveIdentifier(this.props)
          : identifier;

        const contentTypeOpts = getContentTypeOptions(contentTypes);
        const nameSingular = contentTypeOpts.name[Plurality.SINGULAR];
        const canonicalName = contentTypeOpts.name.canonical;

        if (!this.props[nameSingular]) {
          const action = createRequest(canonicalName, subjectId);
          this.props.dispatch(action);
          return null;
        }

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
