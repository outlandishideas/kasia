import invariant from 'invariant';

import makeReducer from './reducer';
import { requestResource } from './api';
import { registerCustomContentType } from './contentTypes';

export { default as ContentTypes } from './constants/ContentTypes';
export { default as connectWordPress } from './connect';

export {
  registerCustomContentType,
  requestResource
};

/**
 * TODO docs
 * @param {String} [wpApiUrl] Location of the WP-API.
 * @param {Boolean} [useEmbedRequestQuery] Should all requests use `_embed` query by default?
 * @param {Array} [customContentTypes] Array of objects describing the custom content types available through WP-API.
 */
export default function configureRepress ({
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
    .map(registerCustomContentType);

  return makeReducer({
    wpApiUrl,
    useEmbedRequestQuery
  });
}
