import { Request, RequestTypes, SubtractPreparedQueries } from './constants/ActionTypes'

/**
 * Initiate a request for a single entity from the WP-API.
 * @param {String} contentType The content type name
 * @param {String|Number} identifier The entity identifier, slug or ID
 * @param {Boolean} [prepared] Is the query a prepared query
 * @returns {Object} Action object
 */
export const createPostRequest = ({ contentType, identifier, prepared = false }) =>
  ({ type: Request.Create, request: RequestTypes.Post, contentType, identifier, prepared })

/**
 * Initiate an arbitrary request to the WP-API.
 * @param {Function} queryFn Function that returns WP-API request
 * @param {Boolean} [prepared] Is the query a prepared query
 * @returns {Object} Action object
 */
export const createQueryRequest = ({ queryFn, prepared = false }) =>
  ({ type: Request.Create, request: RequestTypes.Query, queryFn, prepared })

/**
 * Place the result of a successful request on the store
 * @param {Number} id Query identifier
 * @param {Object} data Raw WP-API response data
 * @param {Boolean} [prepared] Is this a prepared query
 */
export const completeRequest = ({ id, data, prepared = false }) =>
  ({ type: Request.Complete, id, data, prepared })

/**
 * Update the record of a request with the error returned from a failed response.
 * @param {Number} id Query identifier
 * @param {Error} error Error from failed request
 * @param {Error} [prepared] Is this a prepared query
 */
export const failRequest = ({ id, error, prepared = false }) =>
  ({ type: Request.Fail, id, error, prepared })

// Remove an ID from the prepared query ID array.
export const subtractPreparedQueries = () =>
  ({ type: SubtractPreparedQueries })
