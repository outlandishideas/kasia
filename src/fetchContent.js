/* global fetch:false */

import urlencode from 'urlencode'
import merge from 'lodash.merge'

import Plurality from './constants/Plurality'
import invariants from './invariants'
import { EndpointRouteParams } from './constants/WpApiEndpoints'

const defaultOptions = {
  params: {},
  query: {
    _embed: true
  }
}

// TODO check if there are other response statuses and handle them
function handleData (isSlugRequest, response) {
  const idContentNotFound = !isSlugRequest &&
    response && response.data && response.data.status === 404

  const slugContentNotFound = isSlugRequest &&
    response && !response.length

  const contentNotFound = idContentNotFound || slugContentNotFound

  if (!response || contentNotFound) {
    return Promise.reject(new Error('No content found'))
  }

  const data = isSlugRequest
    ? response[0]
    : response

  return { data }
}

/**
 * Make a request to the WP-API for content data.
 * @param {Object} contentTypeOptions Options for the content that is being requested.
 * @param {Array|Number|String} subject Numeric ID or slug
 * @param {Object} config Configuration object from the store
 * @param {Object} [options]
 */
export default function fetchContent (contentTypeOptions, subject, config, options = {}) {
  options = merge({}, defaultOptions, options)

  const requestType = Array.isArray(subject)
    ? Plurality.PLURAL
    : Plurality.SINGULAR

  const isSlugRequest = requestType === Plurality.SINGULAR && typeof subject === 'string'

  let endpoint = [config.host, config.wpApiUrl].join('/')

  if (isSlugRequest && !contentTypeOptions.isCustomContentType) {
    const name = contentTypeOptions.name.canonical
    invariants.notQueryableBySlug(subject, name)
  }

  // Modify request type from SINGLE to PLURAL in the case of a request by slug
  if (isSlugRequest) {
    merge(options.query, { slug: subject })
    endpoint += contentTypeOptions.slug[Plurality.PLURAL]
  } else {
    endpoint += contentTypeOptions.slug[requestType]
  }

  // TODO support more complicated query params by key -> Array? e.g. filter[post__in]
  // Append all query parameters to the endpoint
  endpoint += Object.keys(options.query)
    .reduce((str, optionKey) => {
      const value = typeof options.query[optionKey] !== 'boolean'
        ? '=' + urlencode(options.query[optionKey])
        : ''
      return str + (str.length ? '&' : '?') + optionKey + value
    }, '')

  if (requestType === Plurality.SINGULAR) {
    options.params.id = options.params.id || subject
  } else {
    const postInFilter = subject.map((id) => `filter[post__in][]=${id}`).join('&')
    const sep = endpoint.indexOf('?') !== -1 ? '&' : '?'
    endpoint = [endpoint, sep, postInFilter].join('')
  }

  // Replace route parameter placeholders with corresponding values from `options.params`
  EndpointRouteParams.forEach((param) => {
    if (options.params[param]) {
      endpoint = endpoint.replace(':' + param, options.params[param])
    }
  })

  return fetch(endpoint)
    .then((response) => response.json())
    .then(handleData.bind(null, isSlugRequest))
    .catch((error) => ({ data: { error } }))
}
