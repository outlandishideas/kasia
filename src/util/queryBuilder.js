import chainCall from 'chain-call'
import humps from 'humps'

import OperationTypes from '../constants/OperationTypes'
import contentTypesManager from '../util/contentTypesManager'

const queryBuilder = {}

export default queryBuilder

/**
 * Create a function that dynamically calls the necessary wpapi
 * methods that will fetch data for the given content type item
 * and given identifier (ID or slug depending on its type).
 *
 * Example returned fn for contentType="posts" identifier=16:
 * ```js
 * () => WP.posts().id(16).embed().get()
 * ```
 *
 * @param {Object} WP Instance of `node-wpapi`
 * @param {Object} contentTypeMethodName The method name on wpapi instance
 * @param {String|Number} identifier The identifier's id or slug
 * @returns {Function} A function to make a request to the WP-API
 */
queryBuilder.deriveQuery = function queryBuilderDeriveQuery (WP, contentTypeMethodName, identifier) {
  const identifierFnName = typeof identifier === 'string' ? 'slug' : 'id'
  const identifierCall = [identifierFnName, identifier]
  return () => chainCall(WP, [contentTypeMethodName, identifierCall, 'embed', 'get'])
}

/**
 * Given an `action`, produce a function that will query the WP-API.
 * @param {Object} WP Instance of `node-wpapi`
 * @param {Object} action Redux action object
 * @returns {Function}
 */
queryBuilder.makeQuery = function queryBuilderMakeQuery (WP, action) {
  const { contentType, identifier, queryFn } = action

  let realQueryFn

  if (OperationTypes.Post === action.request) {
    const options = contentTypesManager.get(contentType)
    const methodName = humps.camelize(options.plural)
    realQueryFn = queryBuilder.deriveQuery(WP, methodName, identifier)
  } else if (OperationTypes.Query === action.request) {
    realQueryFn = queryFn
  } else {
    throw new Error(`Unknown request type "${action.request}".`)
  }

  return realQueryFn
}
