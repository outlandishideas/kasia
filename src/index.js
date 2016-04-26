import "babel-polyfill";
import 'isomorphic-fetch';

import invariant from 'invariant';

import makeReducer from './reducer';
import { registerCustomContentType } from './contentTypes';

export { registerCustomContentType };
export { default as ContentTypes } from './constants/ContentTypes';
export { default as connectWordPress } from './connect';

export { fetchCategory, fetchComment, fetchCustomContentType, fetchMedia, fetchPage, fetchPost, fetchPostRevision,
  fetchPostStatus, fetchPostStatus, fetchPostType, fetchTag, fetchTaxonomy, fetchUser } from './actionCreators';

/**
 * Configure Pepperoni.
 * @param {String} [wpApiUrl] Location of the WP-API.
 * @param {Boolean} [useEmbedRequestQuery] Should all requests use `_embed` query by default?
 * @param {Array} [customContentTypes] Array of objects describing the custom content types available through WP-API.
 * @returns {Object} Pepperoni reducer
 */
export default function configurePepperoni ({
  wpApiUrl = null,
  useEmbedRequestQuery = true,
  customContentTypes = []
} = {}) {
  invariant(
    typeof wpApiUrl === 'string',
    'Expecting WP-API URL to be a string, got "%s".',
    typeof wpApiUrl
  );

  customContentTypes
    .forEach(registerCustomContentType);

  return makeReducer({
    wpApiUrl,
    useEmbedRequestQuery
  });
}
