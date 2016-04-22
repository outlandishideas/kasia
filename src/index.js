import ContentTypes from './constants/ContentTypes';
import reducer from './reducer';
import connect from './connect';
import { registerCustomContentType } from './contentTypes';

/**
 * TODO docs
 * @param {String} [apiUrl] Location of the WP-API.
 * @param {Boolean} [useEmbedRequestQuery] Should all requests use `_embed` query by default?
 */
function configure ({
  apiUrl = null,
  useEmbedRequestQuery = true,
} = {}) {
  if (typeof arguments[0] === 'string') {
    apiUrl = arguments[0];
  }
  // TODO place config in store, will require nesting content data so no longer top-level, e.g. store = { config, entities } 
  return reducer;
}

export default {
  configure,
  ContentTypes,
  connect,
  registerCustomContentType
};
