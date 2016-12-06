import humps from 'humps'

import ActionTypes from '../constants/ActionTypes'
import getWP from '../wpapi'
import { contentTypesManager } from '../util'

const QUERY_FN_ARGS = [
  'wpapi',
  'contentTypeMethodName',
  'identifierTypeMethodName',
  'identifierValue'
]

const QUERY_FN_TEMPLATE = `
  return wpapi
    [contentTypeMethodName]()
    [identifierTypeMethodName](identifierValue)
    .embed().get()
`

const queryBuilder = {}

export default queryBuilder

/**
 * Create a function that dynamically calls the necessary wpapi
 * methods that will fetch data for the given content type item
 * and given identifier (ID or slug depending on its type).
 *
 * @example
 * Returned fn for contentTypeMethodName="posts" identifier=16:
 * ```js
 * () => WP.posts().id(16).embed().get()
 * ```
 *
 * @param {Object} contentTypeMethodName The method name on wpapi instance
 * @param {String|Number} identifier The identifier's id or slug
 * @returns {Function} A function to make a request to the WP-API
 */
queryBuilder._deriveQuery = function queryBuilderDeriveQuery (contentTypeMethodName, identifier) {
  return () => new Function(...QUERY_FN_ARGS, QUERY_FN_TEMPLATE)(
    getWP(),
    contentTypeMethodName,
    typeof identifier === 'string' ? 'slug' : 'id',
    identifier
  )
}

/**
 * Given an `action`, produce a function that will query the WP-API.
 * @param {Object} action Redux action object
 * @returns {Function}
 */
queryBuilder.makeQuery = function queryBuilderMakeQuery (action) {
  const { contentType, identifier, queryFn } = action

  let realQueryFn

  if (ActionTypes.RequestCreatePost === action.type) {
    const options = contentTypesManager.get(contentType)
    const methodName = humps.camelize(options.plural)
    realQueryFn = queryBuilder._deriveQuery(methodName, identifier)
  } else if (ActionTypes.RequestCreateQuery === action.type) {
    realQueryFn = queryFn
  } else {
    throw new Error(`Unknown request type "${action.request}".`)
  }

  return realQueryFn
}
