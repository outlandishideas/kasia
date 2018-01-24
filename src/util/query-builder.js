import contentTypesManager from './content-types-manager'

/**
 * Create a function that dynamically calls the necessary wpapi
 * methods that will fetch data for the given content type item
 * and given identifier (ID or slug depending on its type).
 *
 * @example
 * ```js
 * deriveQueryFunction("posts", 16)
 * //=> () => WP.posts().id(16).embed().get()
 * ```
 *
 * @param {Object} contentTypeMethodName The method name on wpapi instance
 * @param {String|Number} identifier The identifier's id or slug
 * @returns {Function} A function to make a request to the WP-API
 */
export function deriveQueryFunction (contentTypeMethodName, identifier) {
  return (wpapi) => {
    const idTypeMethodName = typeof identifier === 'string' ? 'slug' : 'id'
    const contentTypeApi = wpapi[contentTypeMethodName]()
    const query = contentTypeApi[idTypeMethodName](identifier)
    return query.embed().get()
  }
}

/** Given an `action` produce a function that will query the WP-API. */
export function buildQueryFunction (request) {
  const options = contentTypesManager.get(request.contentType)
  return deriveQueryFunction(options.methodName, request.identifier)
}
