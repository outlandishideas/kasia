import chainCall from 'chain-call'

import OperationTypes from '../constants/OperationTypes'
import contentTypes from '../util/contentTypes'
import WP from '../wpapi'

/**
 * Create a function that dynamically calls the necessary wpapi
 * methods that will fetch data for the given content type item.
 *
 * Example returned fn for `contentType`="posts", `identifier`=16:
 * ```js
 * () => {
 *   return WP
 *     .posts()
 *     .id(16)
 *     .embed()
 *     .then((response) => response)
 * }
 * ```
 *
 * @param {Object} contentTypeMethodName The method name on wpapi instance
 * @param {String|Number} identifier The identifier's id or slug
 * @returns {Function} A function to make a request to the WP-API
 */
export function deriveQueryFn (contentTypeMethodName, identifier) {
  return () => chainCall(WP, [
    // Call the content type method
    [contentTypeMethodName],
    // Call the identifier method
    [typeof identifier === 'string' ? 'slug' : 'id', identifier],
    // Call `embed` in order that embedded data is in the response
    ['embed'],
    // Call `then` to invoke the query for data
    ['then', (response) => response]
  ])
}

/**
 * Given an `action`, produce a function that will query the WP-API.
 * @param {Object} action
 * @returns {Function}
 */
export function makeQueryFn (action) {
  const { contentType, identifier, queryFn } = action

  let realQueryFn

  if (OperationTypes.Post === action.request) {
    const options = contentTypes.get(contentType)
    const methodName = camelize(options.plural)
    realQueryFn = deriveQueryFn(methodName, identifier)
  } else if (OperationTypes.Query === action.request) {
    realQueryFn = queryFn
  } else {
    throw new Error(`Unknown request type "${action.request}".`)
  }

  return realQueryFn
}
