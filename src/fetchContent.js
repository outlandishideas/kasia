import invariant from 'invariant';
import urlencode from 'urlencode';
import merge from 'lodash.merge';

import Plurality from './constants/Plurality';
import { EndpointRouteParams, QueryableBySlug } from './constants/WpApiEndpoints';

const defaultOptions = {
  params: {},
  query: {
    _embed: true
  }
};

/**
 * Make a request to the WP-API for content data.
 * @param {Object} contentTypeOptions Options for the content that is being requested.
 * @param {Array|Number|String} subject Numeric ID or slug
 * @param {Object} config Configuration object from the store
 * @param {Object} [options]
 */
export default function fetchContent (contentTypeOptions, subject, config, options = {}) {
  options = merge({}, defaultOptions, options);

  const requestType = Array.isArray(subject)
    ? Plurality.PLURAL
    : Plurality.SINGULAR;

  const isSlugRequest = requestType === Plurality.SINGULAR
    && typeof subject === 'string';

  let endpoint = config.wpApiUrl;

  if (isSlugRequest) {
    const name = contentTypeOptions.name.canonical;

    invariant(
      QueryableBySlug.indexOf(name) !== -1,
      'Got a slug ("%s") as the identifier, but Pepperoni cannot query the content type "%s" by slug. ' +
      'Content types queryable by slug in Pepperoni are: %s. ' +
      'For other content types, provide the slug as a query parameter in `options.query`.',
      subject,
      name,
      QueryableBySlug.join(', ')
    );
  }

  // Modify request type from SINGLE to PLURAL in the case of a request by slug
  if (isSlugRequest) {
    merge(options.query, { slug: subject });
    endpoint += contentTypeOptions.slug[Plurality.PLURAL];
  } else {
    endpoint += contentTypeOptions.slug[requestType];
  }

  // TODO support more complicated query params by key -> Array? e.g. filter[post__in]
  // Append all query parameters to the endpoint
  endpoint += Object.keys(options.query)
    .reduce((str, optionKey) => {
      const value = typeof options.query[optionKey] !== 'boolean'
        ? '=' + urlencode(options.query[optionKey])
        : '';
      return str + (str.length ? `&` : `?`) + optionKey + value;
    }, '');

  if (requestType === Plurality.SINGULAR) {
    options.params.id = options.params.id || subject;
  } else {
    const postInFilter = subject.map(id => `filter[post__in][]=${id}`).join('&');
    const sep = endpoint.indexOf('?') !== -1 ? '&' : '?';
    endpoint = [endpoint, sep, postInFilter].join('');
  }

  // Replace route parameter placeholders with corresponding values from `options.params`
  EndpointRouteParams.forEach(param => {
    if (options.params[param]) {
      endpoint = endpoint.replace(':' + param, options.params[param]);
    }
  });

  return fetch(endpoint)
    .then(response => response.json())
    .then(data => ({ data: isSlugRequest ? data[0] : data }))
    .catch(error => ({ error }));
}
