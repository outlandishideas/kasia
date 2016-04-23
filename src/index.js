import invariant from 'invariant';

import ContentTypes from './constants/ContentTypes';
import makeReducer from './reducer';
import connect from './connect';
import { registerCustomContentType } from './contentTypes';

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
  if (typeof arguments[0] === 'string') {
    wpApiUrl = arguments[0];
  }

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

export {
  ContentTypes,
  connect,
  registerCustomContentType
};
