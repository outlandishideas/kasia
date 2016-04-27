import 'isomorphic-fetch';

import invariant from 'invariant';

import makeReducer from './reducer';
import { makeCustomContentType } from './contentTypes';
import EntityKeyPropNames from './constants/EntityKeyPropNames'

export { default as ContentTypes } from './constants/ContentTypes';
export { default as connectWordPress } from './connect';

export { fetchCategory, fetchComment, fetchCustomContentType, fetchMedia, fetchPage, fetchPost, fetchPostRevision,
  fetchPostStatus, fetchPostStatus, fetchPostType, fetchTag, fetchTaxonomy, fetchUser } from './actionCreators';

/**
 * Configure Pepperoni.
 * @param {String} wpApiUrl Location of the WP-API.
 * @param {Array} [customContentTypes] Array of Object|String describing custom content types available through WP-API.
 * @param {Array} [entityKeyPropName] The property on content items that is used to key entities in the store.
 * @returns {Object} Pepperoni reducer
 */
export default function pepperoni ({
  wpApiUrl,
  customContentTypes = [],
  // TODO let consumer provide a function that takes content object and returns the key for the entity
  entityKeyPropName = EntityKeyPropNames.ID
} = {}) {
  invariant(
    typeof wpApiUrl === 'string',
    'Expecting WP-API URL to be a string, got "%s".',
    typeof wpApiUrl
  );

  invariant(
    Object.keys(EntityKeyPropNames).indexOf(entityKeyPropName) !== -1,
    'Cannot key entities by unknown property "%s". ' +
    'Pass in a built-in key using Pepperoni.EntityKeys, e.g. Pepperoni.EntityKeys.SLUG.',
    entityKeyPropName
  );

  return makeReducer({
    wpApiUrl,
    entityKeyPropName,
    contentTypes: customContentTypes.map(makeCustomContentType)
  });
}
