import contentTypesManager from './content-types-manager'

/** Fetch data for a single post via the `wpapi` instance. */
function queryFn (wpapi, contentTypeMethodName, idTypeMethodName, id) {
  const contentTypeApi = wpapi[contentTypeMethodName]()
  const query = contentTypeApi[idTypeMethodName](id)
  return query.embed().get()
}

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
export function deriveQueryFunction (contentTypeMethodName, identifier) {
  const idMethodName = typeof identifier === 'string' ? 'slug' : 'id'
  return (wpapi) => queryFn(wpapi, contentTypeMethodName, idMethodName, identifier)
}

/** Given an `action` produce a function that will query the WP-API. */
export function buildQueryFunction (action) {
  const options = contentTypesManager.get(action.contentType)
  return deriveQueryFunction(options.methodName, action.identifier)
}
