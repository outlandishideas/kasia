import ActionTypes from '../constants/ActionTypes'

/**
 * Initiate a request for a single entity from the WP-API.
 * @param {String} contentType The content type name
 * @param {String|Number} identifier The entity identifier, slug or ID
 * @returns {Object} Action object
 */
export const createPostRequest = ({ contentType, identifier }) =>
  ({ type: ActionTypes.RequestCreatePost, contentType, identifier })

/**
 * Initiate an arbitrary request to the WP-API.
 * @param {Function} queryFn Function that returns WP-API request
 * @returns {Object} Action object
 */
export const createQueryRequest = ({ queryFn }) =>
  ({ type: ActionTypes.RequestCreateQuery, queryFn })

/**
 * Place the result of a successful request on the store
 * @param {Object} data Raw WP-API response data
 */
export const completeRequest = (data) =>
  ({ type: ActionTypes.RequestComplete, data })

/**
 * Update the record of a request with the error returned from a failed response.
 * @param {Error} error Error from failed request
 */
export const failRequest = (error) =>
  ({ type: ActionTypes.RequestFail, error })

/**
 * Remove all queries in `ids` from the store.
 * @param {Array} ids Array of query IDs
 */
export const deleteQueries = (ids) =>
  ({ type: ActionTypes.DeleteQueries, ids })
