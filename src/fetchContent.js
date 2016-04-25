/* global fetch:false */

import invariant from 'invariant';
import merge from 'lodash.merge';
import urlencode from 'urlencode';

import WpApiEndpoints, {
  RequestTypes,
  EndpointParams,
  QueryableBySlug
} from './constants/WpApiEndpoints';

const defaultOptions = {
  query: {}
};

/**
 * Make a request to the WP-API for content data.
 * @param {String} contentType
 * @param {Number|String} subject
 * @param {Object} config object from the store
 * @param {Object} [options]
 */
export default function fetchContent (contentType, subject, config, options = {}) {
  options = merge({}, defaultOptions, options);

  const requestType = Array.isArray(subject)
    ? RequestTypes.PLURAL
    : RequestTypes.SINGLE;

  const endpointObj = WpApiEndpoints[contentType];

  const isSlugRequest = requestType === RequestTypes.SINGLE
    && typeof subject === 'string';

  if (isSlugRequest) {
    invariant(
      isSlugRequest && QueryableBySlug.includes(contentType),
      'Got a slug ("%s") as the identifier, but Pepperoni cannot query the content type "%s" by slug. ' +
      'Content types queryable by slug in Pepperoni are: %s. ' +
      'For other content types, provide the slug as a query parameter in `options.query`.',
      subject,
      contentType,
      QueryableBySlug.join(', ')
    );
  }

  let endpoint = config.wpApiUrl;

  // Modify request type from SINGLE to PLURAL in the case of a request by slug
  if (isSlugRequest) {
    Object.assign(options.query, { slug: subject });
    endpoint += endpointObj[RequestTypes.PLURAL];
  } else {
    endpoint += endpointObj[requestType];
  }

  // Append all query parameters to the endpoint
  endpoint += Object.keys(options.query)
    .reduce((str, optionKey) => {
      const keyVal = optionKey + '=' + urlencode(options.query[optionKey]);
      return str + (str.length ? `&${keyVal}` : `?${keyVal}`);
    }, '');

  if (requestType === RequestTypes.SINGLE) {
    options.params = options.params || { 'id': subject };
    EndpointParams.forEach(param => {
      if (options.params[param]) {
        endpoint = endpoint.replace(':' + param, options.params[param]);
      }
    });
  }

  return fetch(endpoint);
}
