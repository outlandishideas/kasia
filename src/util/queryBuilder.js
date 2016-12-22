import ActionTypes from '../constants/ActionTypes'
import getWP from '../wpapi'
import { contentTypesManager } from '../util'

function handleQueryFnError (err) {
  // TODO log something useful, e.g. is custom content type declared?
  throw err
}

function queryFn (wpapi, contentTypeMethodName, identifierTypeMethodName, identifierValue) {
  try {
    const contentTypeApi = wpapi[contentTypeMethodName]()
    const query = contentTypeApi[identifierTypeMethodName](identifierValue)
    return query.embed().get().catch(handleQueryFnError)
  } catch (err) {
    handleQueryFnError(err)
  }
}

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
  return () => queryFn(
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
    realQueryFn = queryBuilder._deriveQuery(options.methodName, identifier)
  } else if (ActionTypes.RequestCreateQuery === action.type) {
    realQueryFn = queryFn
  } else {
    throw new Error(`Unknown request type "${action.request}".`)
  }

  return realQueryFn
}
